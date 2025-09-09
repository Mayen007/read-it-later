import json
import os
import sys
from datetime import datetime


def handler(event, context):
    try:
        # Set up the path to import our modules
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))

        from extensions import db
        from article import Article
        from articles_routes import extract_content
        from flask import Flask

        # Create a minimal Flask app just for database operations
        app = Flask(__name__)

        # Database configuration
        DATABASE_URL = os.environ.get('DATABASE_URL')
        if DATABASE_URL:
            app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
        else:
            app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///articles.db'

        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

        # Initialize database
        db.init_app(app)

        with app.app_context():
            db.create_all()

            method = event.get('httpMethod', 'GET')
            path = event.get('path', '')

            # Handle CORS preflight
            if method == 'OPTIONS':
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    },
                    'body': ''
                }

            # GET /articles - Get all articles
            if method == 'GET':
                articles = Article.query.all()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    'body': json.dumps([article.to_dict() for article in articles])
                }

            # POST /articles - Add new article
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                url = body.get('url')

                if not url:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'URL is required'})
                    }

                # Check if article already exists
                existing_article = Article.query.filter_by(url=url).first()
                if existing_article:
                    return {
                        'statusCode': 409,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Article already exists'})
                    }

                # Extract content from URL
                content = extract_content(url)

                # Create new article
                article = Article(
                    url=url,
                    title=content['title'],
                    excerpt=content['excerpt'],
                    author=content['author'],
                    thumbnail_url=content['thumbnail_url'],
                    tags=json.dumps(body.get('tags', []))
                )

                db.session.add(article)
                db.session.commit()

                return {
                    'statusCode': 201,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps(article.to_dict())
                }

            # Handle article-specific operations (PUT, DELETE)
            else:
                # Get article ID from query parameters or path
                article_id = None

                # Try to get ID from query parameters first
                query_params = event.get('queryStringParameters', {}) or {}
                if 'id' in query_params:
                    article_id = int(query_params['id'])
                else:
                    # Extract article ID from path
                    path_parts = path.strip('/').split('/')
                    if len(path_parts) >= 2 and path_parts[-1].isdigit():
                        article_id = int(path_parts[-1])

                if not article_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Article ID is required'})
                    }

                if method == 'PUT':
                    article = Article.query.get(article_id)
                    if not article:
                        return {
                            'statusCode': 404,
                            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                            'body': json.dumps({'error': 'Article not found'})
                        }

                    body = json.loads(event.get('body', '{}'))

                    if 'is_read' in body:
                        article.is_read = body['is_read']
                    if 'tags' in body:
                        article.tags = json.dumps(body['tags'])

                    db.session.commit()
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps(article.to_dict())
                    }

                elif method == 'DELETE':
                    article = Article.query.get(article_id)
                    if article:
                        db.session.delete(article)
                        db.session.commit()
                        return {
                            'statusCode': 200,
                            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                            'body': json.dumps({'message': 'Article deleted successfully'})
                        }
                    else:
                        return {
                            'statusCode': 404,
                            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                            'body': json.dumps({'error': 'Article not found'})
                        }

                return {
                    'statusCode': 405,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Method not allowed'})
                }

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error: {error_details}")

        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': str(e),
                'details': error_details
            })
        }
