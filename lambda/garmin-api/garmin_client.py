import os
import json
import boto3
from garminconnect import Garmin


def get_garmin_client():
    """Fetch garth token from Secrets Manager and init Garmin client."""
    sm = boto3.client('secretsmanager')
    secret = sm.get_secret_value(SecretId=os.environ['GARMIN_TOKEN_SECRET_ARN'])
    token_data = json.loads(secret['SecretString'])
    # token_data is garth OAuth2 token dict
    client = Garmin()
    client.garth.loads(token_data)
    return client


def get_activities_for_date(date_str: str) -> list:
    """Get activities for a specific date (yyyy-mm-dd). Returns list of activity dicts."""
    client = get_garmin_client()
    # Get activities for the date range
    activities = client.get_activities_by_date(date_str, date_str)
    result = []
    for activity in activities:
        activity_type = activity.get('activityType', {}).get('typeKey', '')
        base = {
            'activityId': activity.get('activityId'),
            'activityName': activity.get('activityName', ''),
            'activityType': activity_type,
            'startTimeLocal': activity.get('startTimeLocal', ''),
        }
        if 'pool_swimming' in activity_type or 'swimming' in activity_type:
            base.update({
                'distance': activity.get('distance'),
                'duration': activity.get('duration'),
                'averageSwolf': activity.get('averageSwolf'),
                'averageStrokeRate': activity.get('averageStrokeRate'),
                'averageHR': activity.get('averageHR'),
            })
        elif 'cycling' in activity_type or 'bike' in activity_type:
            base.update({
                'distance': activity.get('distance'),
                'duration': activity.get('duration'),
                'averageSpeed': activity.get('averageSpeed'),
                'averageBikeCadence': activity.get('averageBikeCadence'),
                'elevationGain': activity.get('elevationGain'),
                'averageHR': activity.get('averageHR'),
                'aerobicTrainingEffect': activity.get('aerobicTrainingEffect'),
            })
        elif 'running' in activity_type:
            base.update({
                'distance': activity.get('distance'),
                'duration': activity.get('duration'),
                'averageSpeed': activity.get('averageSpeed'),
                'averageRunningCadenceInStepsPerMinute': activity.get('averageRunningCadenceInStepsPerMinute'),
                'vO2MaxValue': activity.get('vO2MaxValue'),
                'averageHR': activity.get('averageHR'),
                'aerobicTrainingEffect': activity.get('aerobicTrainingEffect'),
            })
        result.append(base)
    return result
