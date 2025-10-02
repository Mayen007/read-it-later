from routes.articles import articles_bp
from flask import Flask, request
from flask_cors import CORS
from extensions import db
import os
import json

app = Flask(__name__)


# Unified database configuration: always use DATABASE_URL
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 'sqlite:///articles.db')

# Recommended SQLAlchemy settings
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)

# Enable CORS for all routes
CORS(app)

# Import and register blueprints after db is initialized
app.register_blueprint(articles_bp, url_prefix='/api/articles')


def init_db():
    """Initialize the database tables using SQLAlchemy models."""
    with app.app_context():
        from models.article import Article
        db.create_all()


if __name__ == '__main__':
    # initialize DB on first run if needed
    init_db()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
