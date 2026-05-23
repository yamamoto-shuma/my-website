import json
import logging

import dynamodb
import garmin_client
import gemini_client

logger = logging.getLogger()
logger.setLevel(logging.INFO)

CORS_ORIGIN = "https://yama-shu.com"


def build_response(status_code: int, data) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": CORS_ORIGIN,
        },
        "body": json.dumps(data, ensure_ascii=False),
    }


def extract_user_id(event: dict) -> str:
    return event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]


def get_date_param(event: dict) -> str:
    return event["pathParameters"]["date"]


# ---------------------------------------------------------------------------
# Route handlers
# ---------------------------------------------------------------------------

def handle_get_activities(event: dict) -> dict:
    user_id = extract_user_id(event)
    date = get_date_param(event)

    # 1. Check DynamoDB cache
    cached = dynamodb.get_activities(user_id, date)
    if cached is not None:
        logger.info("Cache hit for activities user=%s date=%s", user_id, date)
        return build_response(200, cached)

    # 2. Fetch from Garmin API
    try:
        activities = garmin_client.get_activities_for_date(date)
    except Exception as exc:
        logger.error("Garmin API error: %s", exc)
        return build_response(503, {"message": "Garmin API unavailable"})

    # 3. Save to DynamoDB
    try:
        dynamodb.put_activities(user_id, date, activities)
    except Exception as exc:
        # Non-fatal: still return data even if cache write fails
        logger.warning("Failed to cache activities: %s", exc)

    return build_response(200, activities)


def handle_get_notes(event: dict) -> dict:
    user_id = extract_user_id(event)
    date = get_date_param(event)

    item = dynamodb.get_notes(user_id, date)
    if item is None:
        return build_response(200, {})

    # Remove DynamoDB internal keys if present
    item.pop('userId', None)
    item.pop('date', None)
    return build_response(200, item)


def handle_put_notes(event: dict) -> dict:
    user_id = extract_user_id(event)
    date = get_date_param(event)

    body = json.loads(event.get('body') or '{}')
    good = body.get('good', '')
    problem = body.get('problem', '')
    others = body.get('others', '')

    dynamodb.put_notes(user_id, date, good, problem, others)
    return build_response(200, {"message": "Notes saved"})


def handle_get_analysis(event: dict) -> dict:
    user_id = extract_user_id(event)
    date = get_date_param(event)

    item = dynamodb.get_analysis(user_id, date)
    if item is None:
        return build_response(404, {"message": "Analysis not found"})

    return build_response(200, {"analysis": item.get('analysis', '')})


def handle_post_analysis(event: dict) -> dict:
    user_id = extract_user_id(event)
    date = get_date_param(event)

    # Gather input data from DynamoDB
    activities = dynamodb.get_activities(user_id, date) or []
    notes = dynamodb.get_notes(user_id, date)
    profile = dynamodb.get_profile(user_id)

    # Generate analysis via Gemini
    try:
        analysis_text = gemini_client.generate_analysis(activities, notes, profile)
    except Exception as exc:
        logger.error("Gemini API error: %s", exc)
        return build_response(503, {"message": "Gemini API unavailable"})

    # Persist result
    try:
        dynamodb.put_analysis(user_id, date, analysis_text)
    except Exception as exc:
        logger.warning("Failed to save analysis: %s", exc)

    return build_response(200, {"analysis": analysis_text})


def handle_get_profile(event: dict) -> dict:
    user_id = extract_user_id(event)

    item = dynamodb.get_profile(user_id)
    if item is None:
        return build_response(200, {})

    item.pop('userId', None)
    return build_response(200, item)


def handle_put_profile(event: dict) -> dict:
    user_id = extract_user_id(event)

    body = json.loads(event.get('body') or '{}')
    dynamodb.put_profile(user_id, body)
    return build_response(200, {"message": "Profile saved"})


# ---------------------------------------------------------------------------
# Dispatcher
# ---------------------------------------------------------------------------

ROUTES = {
    "GET /garmin/activities/{date}": handle_get_activities,
    "GET /garmin/notes/{date}": handle_get_notes,
    "PUT /garmin/notes/{date}": handle_put_notes,
    "GET /garmin/analysis/{date}": handle_get_analysis,
    "POST /garmin/analysis/{date}": handle_post_analysis,
    "GET /garmin/profile": handle_get_profile,
    "PUT /garmin/profile": handle_put_profile,
}


def lambda_handler(event: dict, context) -> dict:
    route_key = event.get('routeKey', '')
    logger.info("routeKey=%s", route_key)

    handler_fn = ROUTES.get(route_key)
    if handler_fn is None:
        return build_response(404, {"message": f"Route not found: {route_key}"})

    try:
        return handler_fn(event)
    except Exception as exc:
        logger.error("Unhandled error in %s: %s", route_key, exc, exc_info=True)
        return build_response(500, {"message": "Internal server error"})
