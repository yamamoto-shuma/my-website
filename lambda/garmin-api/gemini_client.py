import os
import json
import boto3
import google.generativeai as genai


def get_gemini_client():
    sm = boto3.client('secretsmanager')
    secret = sm.get_secret_value(SecretId=os.environ['GEMINI_API_KEY_SECRET_ARN'])
    api_key = json.loads(secret['SecretString'])['api_key']
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash')


def generate_analysis(activities: list, notes: dict, profile: dict) -> str:
    model = get_gemini_client()

    profile_text = ""
    if profile:
        profile_text = (
            f"\n## プロフィール\n"
            f"目標レース: {profile.get('targetRace', '未設定')}\n"
            f"現在の実力: {profile.get('currentLevel', '未設定')}\n"
        )

    notes_text = (
        f"\n## 本日のノート\n"
        f"Good: {notes.get('good', '')}\n"
        f"Problem: {notes.get('problem', '')}\n"
        f"Others: {notes.get('others', '')}\n"
    ) if notes else "\n## 本日のノート\n（記録なし）\n"

    activities_text = "\n## アクティビティデータ\n"
    if activities:
        for a in activities:
            activities_text += f"- {a.get('activityName', a.get('activityType', 'Activity'))}\n"
            for k, v in a.items():
                if k not in ('activityId', 'activityName', 'activityType', 'startTimeLocal') and v is not None:
                    activities_text += f"  {k}: {v}\n"
    else:
        activities_text += "（アクティビティなし）\n"

    prompt = f"""あなたはトライアスロンのプロコーチです。以下のデータをもとに、選手へのフィードバックをお願いします。
{profile_text}{activities_text}{notes_text}
以下の観点でアドバイスしてください：
1. Problemに記載された内容の具体的な改善方法
2. Othersに記載された疑問への回答
3. アクティビティデータの数値へのコメント（良い点・改善の余地）
4. 明日以降のトレーニングに向けたネクストアクション提案

日本語で回答してください。"""

    response = model.generate_content(prompt)
    return response.text
