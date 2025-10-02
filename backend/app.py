from routes.articles import articles_bp
from flask import Flask, request
from flask_cors import CORS
from extensions import db
import os
import json

app = Flask(__name__)


# Database configuration with proper error handling
database_url = os.environ.get('DATABASE_URL')

# Handle Render.com DATABASE_URL format (postgres:// -> postgresql://)
if database_url and database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

# Set database URI with fallback
app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///articles.db'

# Recommended SQLAlchemy settings
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)

# Enable CORS for all routes
CORS(app)

# Import and register blueprints after db is initialized
app.register_blueprint(articles_bp, url_prefix='/api/articles')

# Health check endpoint for deployment


@app.route('/health')
def health_check():
    return {'status': 'healthy', 'database': app.config['SQLALCHEMY_DATABASE_URI'][:20] + '...'}, 200


def init_db():
    """Initialize the database tables using SQLAlchemy models."""
    with app.app_context():
        from models.article import Article
        db.create_all()


if __name__ == '__main__':
    # initialize DB on first run if needed
    init_db()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
