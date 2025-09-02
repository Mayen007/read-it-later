from app import db
from datetime import datetime


class Article(db.Model):
    __tablename__ = 'articles'

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.Text, unique=True, nullable=False)
    title = db.Column(db.Text)
    excerpt = db.Column(db.Text)
    author = db.Column(db.Text)
    published_date = db.Column(db.Text)
    saved_date = db.Column(db.DateTime, default=datetime.utcnow)
    tags = db.Column(db.Text, default='[]')
    is_read = db.Column(db.Boolean, default=False)
    thumbnail_url = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'excerpt': self.excerpt,
            'author': self.author,
            'published_date': self.published_date,
            'saved_date': self.saved_date.isoformat() if self.saved_date else None,
            'tags': self.tags,
            'is_read': self.is_read,
            'thumbnail_url': self.thumbnail_url,
        }
