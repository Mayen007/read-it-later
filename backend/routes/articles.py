from flask import Blueprint, request, jsonify
from app import db
from models.article import Article

articles_bp = Blueprint('articles', __name__)


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

        # Create Article ORM object
        article = Article(
            url=url,
            title=meta.get('title', ''),
            excerpt=meta.get('excerpt', ''),
            author=meta.get('author', ''),
            published_date=meta.get('published_date', ''),
            thumbnail_url=meta.get('thumbnail_url', ''),
            tags='[]'
        )

        try:
            db.session.add(article)
            db.session.commit()
            return jsonify({'id': article.id, 'url': url, **meta}), 201
        except Exception as e:
            db.session.rollback()
            # Unique constraint violation or other DB error
            return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error saving article: {str(e)}")
        return jsonify({'error': str(e)}), 500


@articles_bp.route('', methods=['GET'])
def list_articles():
    articles = Article.query.all()
    return jsonify([a.to_dict() for a in articles])


@articles_bp.route('/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    data = request.get_json()
    is_read = data.get('is_read')
    article = Article.query.get_or_404(article_id)
    article.is_read = bool(is_read)
    db.session.commit()
    return jsonify({'id': article_id, 'is_read': article.is_read})


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    article = Article.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return '', 204
