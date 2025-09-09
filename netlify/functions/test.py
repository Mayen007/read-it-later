import json
import os


def handler(event, context):
    """Simple test function to verify Netlify Functions work"""

    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            },
            'body': ''
        }

    # Simple response to test if function is working
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')

    response_data = {
        'message': 'Netlify Function is working!',
        'method': method,
        'path': path,
        'timestamp': '2025-09-09',
        'environment': 'production' if os.environ.get('DATABASE_URL') else 'development'
    }

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(response_data)
    }
