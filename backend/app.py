from routes.articles import articles_bp
from flask import Flask, request
from flask_cors import CORS
from extensions import db
import os
import json
import sys

app = Flask(__name__)


# Database configuration with proper error handling
database_url = os.environ.get('DATABASE_URL', '').strip()

# Handle malformed or empty DATABASE_URL
if not database_url:
    database_url = 'sqlite:///articles.db'
    print("Warning: DATABASE_URL not set, using SQLite fallback")
else:
    # Clean up malformed URLs (remove psql prefix if present)
    if database_url.startswith("psql '"):
        database_url = database_url.replace("psql '", "").rstrip("'")
        print("Cleaned malformed DATABASE_URL")

    # Handle Render.com DATABASE_URL format (postgres:// -> postgresql://)
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
        print("Converted postgres:// to postgresql://")

    # Validate URL format - if it doesn't look like a valid URL, fall back to SQLite
    if not (database_url.startswith(('postgresql://', 'mysql://', 'sqlite://')) or '://' in database_url):
        print(f"Invalid DATABASE_URL format: {database_url[:50]}")
        database_url = 'sqlite:///articles.db'
        print("Falling back to SQLite due to invalid DATABASE_URL")

# Set database URI
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
print(f"Final database URI: {database_url[:30]}...")

# Initialize extensions with error handling
try:
    db.init_app(app)
    print("Database initialized successfully")
except ImportError as e:
    if 'psycopg2' in str(e):
        print(f"PostgreSQL driver error: {e}")
        print("Falling back to SQLite...")
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fallback.db'
        db.init_app(app)
        print("Using SQLite fallback database")
    else:
        raise e
except Exception as e:
    print(f"Database initialization error: {e}")
    print("Falling back to SQLite...")
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///fallback.db'
    db.init_app(app)
    print("Using SQLite fallback database")

# Enable CORS for all routes
CORS(app)

# Import and register blueprints after db is initialized
app.register_blueprint(articles_bp, url_prefix='/api/articles')

# Health check endpoint for deployment


@app.route('/health')
def health_check():
    env_db_url = os.environ.get('DATABASE_URL', 'Not set')
    return {
        'status': 'healthy',
        'database': app.config['SQLALCHEMY_DATABASE_URI'][:30] + '...',
        'env_database_url': env_db_url[:30] + '...' if env_db_url != 'Not set' else 'Not set',
        'python_version': f"{sys.version_info.major}.{sys.version_info.minor}"
    }, 200


def init_db():
    """Initialize the database tables using SQLAlchemy models."""
    with app.app_context():
        from models.article import Article
        db.create_all()


if __name__ == '__main__':
    # initialize DB on first run if needed
    init_db()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)
