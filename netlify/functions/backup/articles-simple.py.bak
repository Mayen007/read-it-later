import json
import os
import sys
from datetime import datetime


def handler(event, context):
    try:
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

        method = event.get('httpMethod', 'GET')
        DATABASE_URL = os.environ.get('DATABASE_URL')

        if not DATABASE_URL:
            return {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({
                    'error': 'DATABASE_URL not configured',
                    'message': 'Please add DATABASE_URL environment variable in Netlify dashboard'
                })
            }

        # Use psycopg2 directly for database operations
        import psycopg2
        from psycopg2.extras import RealDictCursor
        import requests
        from bs4 import BeautifulSoup
        from urllib.parse import urljoin

        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Create table if it doesn't exist
        cur.execute('''
            CREATE TABLE IF NOT EXISTS articles (
                id SERIAL PRIMARY KEY,
                url TEXT UNIQUE NOT NULL,
                title TEXT,
                excerpt TEXT,
                author TEXT,
                published_date TEXT,
                saved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tags TEXT DEFAULT '[]',
                is_read BOOLEAN DEFAULT FALSE,
                thumbnail_url TEXT
            )
        ''')
        conn.commit()

        # Handle different HTTP methods
        if method == 'GET':
            cur.execute('SELECT * FROM articles ORDER BY saved_date DESC')
            articles = cur.fetchall()

            # Convert to JSON-serializable format
            result = []
            for article in articles:
                result.append({
                    'id': article['id'],
                    'url': article['url'],
                    'title': article['title'],
                    'excerpt': article['excerpt'],
                    'author': article['author'],
                    'published_date': article['published_date'],
                    'saved_date': article['saved_date'].isoformat() + 'Z' if article['saved_date'] else None,
                    'tags': article['tags'],
                    'is_read': article['is_read'],
                    'thumbnail_url': article['thumbnail_url']
                })

            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps(result)
            }

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
            cur.execute('SELECT id FROM articles WHERE url = %s', (url,))
            if cur.fetchone():
                return {
                    'statusCode': 409,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Article already exists'})
                }

            # Extract content from URL
            try:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                response = requests.get(url, headers=headers, timeout=10)
                soup = BeautifulSoup(response.content, 'html.parser')

                # Extract title
                title = 'Untitled'
                for selector in ['h1', 'title', '[property="og:title"]']:
                    element = soup.select_one(selector)
                    if element:
                        title = element.get_text(strip=True) or element.get(
                            'content', '').strip()
                        if title:
                            break

                # Extract excerpt
                excerpt = 'No description available'
                for selector in ['[property="og:description"]', '[name="description"]', 'p']:
                    element = soup.select_one(selector)
                    if element:
                        excerpt = element.get_text(
                            strip=True) or element.get('content', '').strip()
                        if excerpt and len(excerpt) > 50:
                            excerpt = excerpt[:300] + \
                                '...' if len(excerpt) > 300 else excerpt
                            break

                # Extract author
                author = None
                for selector in ['[property="article:author"]', '[name="author"]', '.author']:
                    element = soup.select_one(selector)
                    if element:
                        author = element.get_text(
                            strip=True) or element.get('content', '').strip()
                        if author:
                            break

                # Extract thumbnail
                thumbnail_url = None
                for selector in ['[property="og:image"]', '[name="twitter:image"]']:
                    element = soup.select_one(selector)
                    if element:
                        thumbnail_url = element.get('content')
                        if thumbnail_url:
                            thumbnail_url = urljoin(url, thumbnail_url)
                            break

            except Exception as e:
                title = 'Error extracting content'
                excerpt = f'Failed to extract content: {str(e)}'
                author = None
                thumbnail_url = None

            # Insert article
            cur.execute('''
                INSERT INTO articles (url, title, excerpt, author, thumbnail_url, tags)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, url, title, excerpt, author, published_date, saved_date, tags, is_read, thumbnail_url
            ''', (url, title, excerpt, author, thumbnail_url, json.dumps(body.get('tags', []))))

            article = cur.fetchone()
            conn.commit()

            result = {
                'id': article['id'],
                'url': article['url'],
                'title': article['title'],
                'excerpt': article['excerpt'],
                'author': article['author'],
                'published_date': article['published_date'],
                'saved_date': article['saved_date'].isoformat() + 'Z' if article['saved_date'] else None,
                'tags': article['tags'],
                'is_read': article['is_read'],
                'thumbnail_url': article['thumbnail_url']
            }

            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps(result)
            }

        # Handle PUT and DELETE with query parameters
        else:
            query_params = event.get('queryStringParameters', {}) or {}
            article_id = query_params.get('id')

            if not article_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Article ID is required'})
                }

            if method == 'PUT':
                body = json.loads(event.get('body', '{}'))

                # Build update query
                updates = []
                params = []

                if 'is_read' in body:
                    updates.append('is_read = %s')
                    params.append(body['is_read'])

                if 'tags' in body:
                    updates.append('tags = %s')
                    params.append(json.dumps(body['tags']))

                if not updates:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'No valid fields to update'})
                    }

                params.append(article_id)
                query = f'''
                    UPDATE articles SET {', '.join(updates)}
                    WHERE id = %s
                    RETURNING id, url, title, excerpt, author, published_date, saved_date, tags, is_read, thumbnail_url
                '''

                cur.execute(query, params)
                article = cur.fetchone()

                if not article:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Article not found'})
                    }

                conn.commit()

                result = {
                    'id': article['id'],
                    'url': article['url'],
                    'title': article['title'],
                    'excerpt': article['excerpt'],
                    'author': article['author'],
                    'published_date': article['published_date'],
                    'saved_date': article['saved_date'].isoformat() + 'Z' if article['saved_date'] else None,
                    'tags': article['tags'],
                    'is_read': article['is_read'],
                    'thumbnail_url': article['thumbnail_url']
                }

                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps(result)
                }

            elif method == 'DELETE':
                cur.execute(
                    'DELETE FROM articles WHERE id = %s RETURNING id', (article_id,))
                deleted = cur.fetchone()

                if not deleted:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Article not found'})
                    }

                conn.commit()

                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'message': 'Article deleted successfully'})
                }

        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()

        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': str(e),
                'details': error_details,
                'function': 'articles-simple'
            })
        }

    finally:
        if 'conn' in locals():
            conn.close()
