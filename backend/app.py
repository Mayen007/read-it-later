from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

from routes.articles import articles_bp

app = Flask(__name__)

# Database configuration: use DATABASE_URL if provided, otherwise a local sqlite file
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///articles.db'

# Recommended SQLAlchemy settings
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Enable CORS for all routes
CORS(app)

app.register_blueprint(articles_bp, url_prefix='/api/articles')


def init_db():
    """Initialize the database tables using SQLAlchemy models."""
    from models.article import Article

    db.create_all()


if __name__ == '__main__':
    # initialize DB on first run if needed
    init_db()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
