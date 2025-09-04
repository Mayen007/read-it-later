from flask import Blueprint, request, jsonify

articles_bp = Blueprint('articles', __name__)


@articles_bp.route('', methods=['POST'])
def add_article():
    from extensions import db
    from models.article import Article
    from sqlalchemy.exc import IntegrityError

    try:
        data = request.get_json()
        url = data.get('url')
        if not url:
            return jsonify({'error': 'URL is required'}), 400

        # Check if article with this URL already exists
        existing_article = Article.query.filter_by(url=url).first()
        if existing_article:
            return jsonify({'error': 'This article has already been saved'}), 409

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
            return jsonify(article.to_dict()), 201
        except IntegrityError as e:
            db.session.rollback()
            # Handle unique constraint violation
            error_str = str(e).lower()
            if 'unique constraint failed' in error_str or 'unique' in error_str:
                return jsonify({'error': 'This article has already been saved'}), 409
            else:
                print(f"Database integrity error: {str(e)}")
                return jsonify({'error': 'Database error occurred'}), 500
        except Exception as e:
            db.session.rollback()
            print(f"Database error: {str(e)}")
            return jsonify({'error': 'Failed to save article'}), 500
    except Exception as e:
        print(f"Error saving article: {str(e)}")
        return jsonify({'error': 'Failed to process request'}), 500


@articles_bp.route('', methods=['GET'])
def list_articles():
    from models.article import Article

    articles = Article.query.all()
    return jsonify([a.to_dict() for a in articles])


@articles_bp.route('/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    from extensions import db
    from models.article import Article

    data = request.get_json()
    is_read = data.get('is_read')
    article = Article.query.get_or_404(article_id)
    article.is_read = bool(is_read)
    db.session.commit()
    return jsonify({'id': article_id, 'is_read': article.is_read})


@articles_bp.route('/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    from extensions import db
    from models.article import Article

    article = Article.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return '', 204
