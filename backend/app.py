from flask import Flask
from flask_cors import CORS
from routes.articles import articles_bp

app = Flask(__name__)
app.config['DATABASE'] = 'articles.db'

# Enable CORS for all routes
CORS(app)

app.register_blueprint(articles_bp, url_prefix='/api/articles')

if __name__ == '__main__':
    app.run(debug=True)
