import os
import boto3
import json
import time
from datetime import datetime, timezone

dynamodb = boto3.resource('dynamodb')


def get_item(table_name: str, key: dict):
    table = dynamodb.Table(table_name)
    resp = table.get_item(Key=key)
    return resp.get('Item')


def put_item(table_name: str, item: dict):
    table = dynamodb.Table(table_name)
    table.put_item(Item=item)


def get_activities(user_id: str, date: str):
    item = get_item(os.environ['ACTIVITIES_TABLE'], {'userId': user_id, 'date': date})
    if item is None:
        return None
    # Check TTL expiry manually (DynamoDB TTL has up to 48h lag)
    if 'ttl' in item and item['ttl'] < int(time.time()):
        return None
    return json.loads(item['data'])


def put_activities(user_id: str, date: str, activities: list):
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    item = {'userId': user_id, 'date': date, 'data': json.dumps(activities)}
    if date >= today:  # today or future
        item['ttl'] = int(time.time()) + 3600  # 1 hour TTL
    put_item(os.environ['ACTIVITIES_TABLE'], item)


def get_notes(user_id: str, date: str):
    return get_item(os.environ['NOTES_TABLE'], {'userId': user_id, 'date': date})


def put_notes(user_id: str, date: str, good: str, problem: str, others: str):
    put_item(os.environ['NOTES_TABLE'], {
        'userId': user_id, 'date': date,
        'good': good, 'problem': problem, 'others': others
    })


def get_analysis(user_id: str, date: str):
    return get_item(os.environ['AI_ANALYSIS_TABLE'], {'userId': user_id, 'date': date})


def put_analysis(user_id: str, date: str, analysis: str):
    put_item(os.environ['AI_ANALYSIS_TABLE'], {'userId': user_id, 'date': date, 'analysis': analysis})


def get_profile(user_id: str):
    return get_item(os.environ['PROFILES_TABLE'], {'userId': user_id})


def put_profile(user_id: str, profile: dict):
    profile['userId'] = user_id
    put_item(os.environ['PROFILES_TABLE'], profile)
