import requests
from bs4 import BeautifulSoup

# Simple metadata extractor for a given URL


def extract_metadata(url):
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        # Extract title
        title = soup.title.string.strip() if soup.title else ''

        # Try multiple ways to get description/excerpt
        excerpt = ''
        desc_selectors = [
            ('meta', {'name': 'description'}),
            ('meta', {'property': 'og:description'}),
            ('meta', {'name': 'twitter:description'}),
        ]
        for tag_name, attrs in desc_selectors:
            desc_tag = soup.find(tag_name, attrs=attrs)
            if desc_tag and desc_tag.get('content'):
                excerpt = desc_tag['content'].strip()
                break

        # Try multiple ways to get author
        author = ''
        author_selectors = [
            ('meta', {'name': 'author'}),
            ('meta', {'property': 'article:author'}),
            ('meta', {'name': 'twitter:creator'}),
        ]
        for tag_name, attrs in author_selectors:
            author_tag = soup.find(tag_name, attrs=attrs)
            if author_tag and author_tag.get('content'):
                author = author_tag['content'].strip()
                break

        # Try multiple ways to get published date
        published_date = ''
        date_selectors = [
            ('meta', {'property': 'article:published_time'}),
            ('meta', {'name': 'date'}),
            ('meta', {'name': 'publish_date'}),
            ('meta', {'property': 'article:published'}),
        ]
        for tag_name, attrs in date_selectors:
            date_tag = soup.find(tag_name, attrs=attrs)
            if date_tag and date_tag.get('content'):
                published_date = date_tag['content'].strip()
                break

        # Try to get thumbnail
        thumbnail_url = ''
        thumb_selectors = [
            ('meta', {'property': 'og:image'}),
            ('meta', {'name': 'twitter:image'}),
        ]
        for tag_name, attrs in thumb_selectors:
            thumb_tag = soup.find(tag_name, attrs=attrs)
            if thumb_tag and thumb_tag.get('content'):
                thumbnail_url = thumb_tag['content'].strip()
                break

        return {
            'title': title,
            'excerpt': excerpt,
            'author': author,
            'published_date': published_date,
            'thumbnail_url': thumbnail_url
        }
    except Exception as e:
        return {
            'title': '',
            'excerpt': '',
            'author': '',
            'published_date': '',
            'thumbnail_url': ''
        }
