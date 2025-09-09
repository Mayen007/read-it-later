"""
Read-it-Later API - Single Clean Function
Handles all article operations with minimal dependencies
"""
import json
import os
from datetime import datetime
from urllib.parse import urljoin


def handler(event, context):
    """Main handler for all article operations"""

    # CORS headers for all responses
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    }

    try:
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

        # Get database connection
        DATABASE_URL = os.environ.get('DATABASE_URL')
        if not DATABASE_URL:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({
                    'error': 'Database not configured',
                    'message': 'Please set DATABASE_URL environment variable'
                })
            }

        # Import database module
        import psycopg2
        from psycopg2.extras import RealDictCursor

        # Connect to database
        with psycopg2.connect(DATABASE_URL) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                # Ensure articles table exists
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS articles (
                        id SERIAL PRIMARY KEY,
                        url TEXT UNIQUE NOT NULL,
                        title TEXT NOT NULL DEFAULT 'Untitled',
                        excerpt TEXT DEFAULT '',
                        author TEXT DEFAULT '',
                        thumbnail_url TEXT DEFAULT '',
                        tags JSONB DEFAULT '[]',
                        is_read BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)

                # Route based on HTTP method
                method = event.get('httpMethod', 'GET')
                query_params = event.get('queryStringParameters') or {}

                # GET: List all articles
                if method == 'GET':
                    cur.execute("""
                        SELECT id, url, title, excerpt, author, thumbnail_url, 
                               tags, is_read, created_at, updated_at
                        FROM articles
                        ORDER BY created_at DESC
                        LIMIT 100
                    """)
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
                            'thumbnail_url': article['thumbnail_url'],
                            'tags': article['tags'] or [],
                            'is_read': article['is_read'],
                            'created_at': article['created_at'].isoformat() if article['created_at'] else None,
                            'updated_at': article['updated_at'].isoformat() if article['updated_at'] else None
                        })

                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps(result)
                    }

                # POST: Create new article
                elif method == 'POST':
                    body = json.loads(event.get('body', '{}'))
                    url = body.get('url', '').strip()

                    if not url:
                        return {
                            'statusCode': 400,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'URL is required'})
                        }

                    # Check if article already exists
                    cur.execute(
                        'SELECT id FROM articles WHERE url = %s', (url,))
                    if cur.fetchone():
                        return {
                            'statusCode': 409,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Article already exists'})
                        }

                    # Extract metadata from URL
                    metadata = extract_metadata(url)

                    # Insert article
                    cur.execute("""
                        INSERT INTO articles (url, title, excerpt, author, thumbnail_url, tags)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id, url, title, excerpt, author, thumbnail_url, tags, 
                                  is_read, created_at, updated_at
                    """, (
                        url,
                        metadata['title'],
                        metadata['excerpt'],
                        metadata['author'],
                        metadata['thumbnail_url'],
                        json.dumps(body.get('tags', []))
                    ))

                    article = cur.fetchone()

                    result = {
                        'id': article['id'],
                        'url': article['url'],
                        'title': article['title'],
                        'excerpt': article['excerpt'],
                        'author': article['author'],
                        'thumbnail_url': article['thumbnail_url'],
                        'tags': article['tags'] or [],
                        'is_read': article['is_read'],
                        'created_at': article['created_at'].isoformat() if article['created_at'] else None,
                        'updated_at': article['updated_at'].isoformat() if article['updated_at'] else None
                    }

                    return {
                        'statusCode': 201,
                        'headers': cors_headers,
                        'body': json.dumps(result)
                    }

                # PUT: Update existing article
                elif method == 'PUT':
                    article_id = query_params.get('id')
                    if not article_id:
                        return {
                            'statusCode': 400,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Article ID is required'})
                        }

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
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'No valid fields to update'})
                        }

                    updates.append('updated_at = CURRENT_TIMESTAMP')
                    params.append(article_id)

                    query = f"""
                        UPDATE articles 
                        SET {', '.join(updates)}
                        WHERE id = %s
                        RETURNING id, url, title, excerpt, author, thumbnail_url, tags, 
                                  is_read, created_at, updated_at
                    """

                    cur.execute(query, params)
                    article = cur.fetchone()

                    if not article:
                        return {
                            'statusCode': 404,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Article not found'})
                        }

                    result = {
                        'id': article['id'],
                        'url': article['url'],
                        'title': article['title'],
                        'excerpt': article['excerpt'],
                        'author': article['author'],
                        'thumbnail_url': article['thumbnail_url'],
                        'tags': article['tags'] or [],
                        'is_read': article['is_read'],
                        'created_at': article['created_at'].isoformat() if article['created_at'] else None,
                        'updated_at': article['updated_at'].isoformat() if article['updated_at'] else None
                    }

                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps(result)
                    }

                # DELETE: Delete article
                elif method == 'DELETE':
                    article_id = query_params.get('id')
                    if not article_id:
                        return {
                            'statusCode': 400,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Article ID is required'})
                        }

                    cur.execute(
                        'DELETE FROM articles WHERE id = %s RETURNING id', (article_id,))
                    deleted = cur.fetchone()

                    if not deleted:
                        return {
                            'statusCode': 404,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Article not found'})
                        }

                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({'message': 'Article deleted successfully'})
                    }

                else:
                    return {
                        'statusCode': 405,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Method not allowed'})
                    }

    except Exception as e:
        import traceback
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__,
                'traceback': traceback.format_exc()
            })
        }


def extract_metadata(url):
    """Extract title, excerpt, author, and thumbnail from URL"""

    try:
        import requests
        from bs4 import BeautifulSoup

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract title
        title = None
        for selector in ['meta[property="og:title"]', 'meta[name="twitter:title"]', 'title', 'h1']:
            element = soup.select_one(selector)
            if element:
                title = element.get('content') or element.get_text(strip=True)
                if title and len(title.strip()) > 0:
                    break

        # Extract excerpt
        excerpt = None
        for selector in ['meta[property="og:description"]', 'meta[name="description"]']:
            element = soup.select_one(selector)
            if element:
                excerpt = element.get('content', '').strip()
                if excerpt and len(excerpt) > 20:
                    break

        # Extract author
        author = None
        for selector in ['meta[property="article:author"]', 'meta[name="author"]']:
            element = soup.select_one(selector)
            if element:
                author = element.get('content') or element.get_text(strip=True)
                if author:
                    break

        # Extract thumbnail
        thumbnail_url = None
        for selector in ['meta[property="og:image"]', 'meta[name="twitter:image"]']:
            element = soup.select_one(selector)
            if element:
                thumbnail_url = element.get('content')
                if thumbnail_url:
                    thumbnail_url = urljoin(url, thumbnail_url)
                    break

        return {
            'title': title or 'Untitled',
            'excerpt': excerpt or '',
            'author': author or '',
            'thumbnail_url': thumbnail_url or ''
        }

    except Exception as e:
        return {
            'title': f'Error: {str(e)}',
            'excerpt': 'Failed to extract content from URL',
            'author': '',
            'thumbnail_url': ''
        }
