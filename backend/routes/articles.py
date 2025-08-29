from flask import Blueprint, request, jsonify
import sqlite3

articles_bp = Blueprint('articles', __name__)
DB_PATH = 'articles.db'


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@articles_bp.route('', methods=['POST'])
def add_article():
    try:
        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify({'error': 'URL is required'}), 400

        # Extract metadata
        from services.content_extractor import extract_metadata
        meta = extract_metadata(url)

        conn = get_db()
        cur = conn.cursor()
        try:
            cur.execute('''
                INSERT INTO articles (url, title, excerpt, author, published_date, thumbnail_url, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                url,
                meta.get('title', ''),
                meta.get('excerpt', ''),
                meta.get('author', ''),
                meta.get('published_date', ''),
                meta.get('thumbnail_url', ''),
                '[]'  # Empty JSON array for tags
            ))
            conn.commit()
            article_id = cur.lastrowid
            return jsonify({'id': article_id, 'url': url, **meta}), 201
        except sqlite3.IntegrityError:
            return jsonify({'error': 'This URL has already been saved.'}), 409
        finally:
            conn.close()
    except Exception as e:
        print(f"Error saving article: {str(e)}")  # Log to console
        return jsonify({'error': str(e)}), 500


@articles_bp.route('', methods=['GET'])
def list_articles():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM articles')
    articles = [dict(row) for row in cur.fetchall()]
    conn.close()
    return jsonify(articles)


@articles_bp.route('/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    data = request.get_json()
    is_read = data.get('is_read')
    conn = get_db()
    cur = conn.cursor()
    cur.execute('UPDATE articles SET is_read = ? WHERE id = ?',
                (is_read, article_id))
    conn.commit()
    conn.close()
    return jsonify({'id': article_id, 'is_read': is_read})


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM articles WHERE id = ?', (article_id,))
    conn.commit()
    conn.close()
    return '', 204
