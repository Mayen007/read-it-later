from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, Integer, Text, DateTime, Boolean
import json
import os
import sys
sys.path.append('/opt/buildhome/python')


Base = declarative_base()


class Article(Base):
    __tablename__ = 'articles'

    id = Column(Integer, primary_key=True)
    url = Column(Text, unique=True, nullable=False)
    title = Column(Text)
    excerpt = Column(Text)
    author = Column(Text)
    published_date = Column(Text)
    saved_date = Column(DateTime, default=datetime.utcnow)
    tags = Column(Text, default='[]')
    is_read = Column(Boolean, default=False)
    thumbnail_url = Column(Text)

    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'title': self.title,
            'excerpt': self.excerpt,
            'author': self.author,
            'published_date': self.published_date,
            'saved_date': self.saved_date.isoformat() + 'Z' if self.saved_date else None,
            'tags': self.tags,
            'is_read': self.is_read,
            'thumbnail_url': self.thumbnail_url,
        }


def handler(event, context):
    try:
        # Database connection
        DATABASE_URL = os.environ.get('DATABASE_URL')
        if not DATABASE_URL:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'DATABASE_URL not configured'})
            }

        engine = create_engine(DATABASE_URL)
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        session = Session()

        # Handle different HTTP methods
        method = event.get('httpMethod', 'GET')

        if method == 'GET':
            articles = session.query(Article).all()
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps([article.to_dict() for article in articles])
            }

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            article = Article(**body)
            session.add(article)
            session.commit()

            return {
                'statusCode': 201,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps(article.to_dict())
            }

        else:
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'})
            }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if 'session' in locals():
            session.close()
