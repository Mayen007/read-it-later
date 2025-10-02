"""
Simple test function to verify Netlify Python functions work
This is a minimal function to test deployment
"""

def handler(event, context):
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': '{"message": "Hello from Netlify!", "status": "working"}'
    }