from flask import Blueprint, request, jsonify
from extensions import db
from article import Article
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re

articles_bp = Blueprint('articles', __name__)


def extract_content(url):
    """Extract article content from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract title
        title = None
        title_selectors = ['h1', 'title',
                           '[property="og:title"]', '.title', '.article-title']
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element:
                title = element.get_text(strip=True) or element.get(
                    'content', '').strip()
                if title:
                    break

        # Extract excerpt/description
        excerpt = None
        excerpt_selectors = [
            '[property="og:description"]',
            '[name="description"]',
            '.excerpt',
            '.summary',
            'p'
        ]
        for selector in excerpt_selectors:
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
        author_selectors = [
            '[property="article:author"]',
            '[name="author"]',
            '.author',
            '.byline'
        ]
        for selector in author_selectors:
            element = soup.select_one(selector)
            if element:
                author = element.get_text(
                    strip=True) or element.get('content', '').strip()
                if author:
                    break

        # Extract thumbnail
        thumbnail_url = None
        thumb_selectors = [
            '[property="og:image"]',
            '[name="twitter:image"]',
            '.featured-image img',
            'article img',
            '.thumbnail'
        ]
        for selector in thumb_selectors:
            element = soup.select_one(selector)
            if element:
                thumbnail_url = element.get(
                    'content') or element.get('src', '')
                if thumbnail_url:
                    thumbnail_url = urljoin(url, thumbnail_url)
                    break

        return {
            'title': title or 'Untitled',
            'excerpt': excerpt or 'No description available',
            'author': author,
            'thumbnail_url': thumbnail_url
        }

    except Exception as e:
        return {
            'title': 'Error extracting content',
            'excerpt': f'Failed to extract content: {str(e)}',
            'author': None,
            'thumbnail_url': None
        }


@articles_bp.route('/', methods=['GET'])
def get_articles():
    """Get all articles"""
    try:
        articles = Article.query.all()
        return jsonify([article.to_dict() for article in articles])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@articles_bp.route('/', methods=['POST'])
def add_article():
    """Add a new article"""
    try:
        data = request.get_json()
        url = data.get('url')

        if not url:
            return jsonify({'error': 'URL is required'}), 400

        # Check if article already exists
        existing_article = Article.query.filter_by(url=url).first()
        if existing_article:
            return jsonify({'error': 'Article already exists'}), 409

        # Extract content from URL
        content = extract_content(url)

        # Create new article
        article = Article(
            url=url,
            title=content['title'],
            excerpt=content['excerpt'],
            author=content['author'],
            thumbnail_url=content['thumbnail_url'],
            tags=json.dumps(data.get('tags', []))
        )

        db.session.add(article)
        db.session.commit()

        return jsonify(article.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    """Update an article"""
    try:
        article = Article.query.get_or_404(article_id)
        data = request.get_json()

        if 'is_read' in data:
            article.is_read = data['is_read']
        if 'tags' in data:
            article.tags = json.dumps(data['tags'])

        db.session.commit()
        return jsonify(article.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    """Delete an article"""
    try:
        article = Article.query.get_or_404(article_id)
        db.session.delete(article)
        db.session.commit()
        return jsonify({'message': 'Article deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
