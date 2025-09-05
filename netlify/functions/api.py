import json
import os
from flask import Flask
from flask_cors import CORS
from extensions import db
from articles_routes import articles_bp
from article import Article

# Create Flask app
app = Flask(__name__)

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///articles.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
CORS(app)

# Register blueprints
app.register_blueprint(articles_bp, url_prefix='/api/articles')

# Initialize database
with app.app_context():
    db.create_all()


def handler(event, context):
    """Netlify Functions handler"""
    import io
    from urllib.parse import urlencode

    # Handle preflight CORS requests
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

    # Convert query parameters to query string
    query_params = event.get('queryStringParameters') or {}
    query_string = urlencode(query_params) if query_params else ''

    # Get request body
    body = event.get('body', '') or ''
    if event.get('isBase64Encoded'):
        import base64
        body = base64.b64decode(body).decode('utf-8')

    # Convert Netlify event to WSGI environ
    environ = {
        'REQUEST_METHOD': event.get('httpMethod', 'GET'),
        # Remove /api prefix
        'PATH_INFO': event.get('path', '/').replace('/api', ''),
        'QUERY_STRING': query_string,
        'CONTENT_TYPE': event.get('headers', {}).get('content-type', 'application/json'),
        'CONTENT_LENGTH': str(len(body.encode('utf-8'))),
        'wsgi.input': io.BytesIO(body.encode('utf-8')),
        'SERVER_NAME': 'localhost',
        'SERVER_PORT': '443',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'https',
        'wsgi.errors': io.StringIO(),
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
    }

    # Add headers to environ
    for key, value in event.get('headers', {}).items():
        key = 'HTTP_' + key.upper().replace('-', '_')
        environ[key] = value

    # Capture response data
    response_data = {'headers': {}}

    def start_response(status, headers):
        response_data['statusCode'] = int(status.split(' ')[0])
        response_data['headers'] = dict(headers)
        # Add CORS headers
        response_data['headers']['Access-Control-Allow-Origin'] = '*'
        response_data['headers']['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response_data['headers']['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'

    # Process request through Flask app
    try:
        response = app(environ, start_response)
        response_body = b''.join(response).decode('utf-8')
        response_data['body'] = response_body

        return response_data

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': str(e)})
        }
