import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse

# Enhanced metadata extractor for a given URL

# Default fallback thumbnail - use the application logo
DEFAULT_THUMBNAIL = "http://localhost:3001/logo.png"


def extract_metadata(url):
    try:
        # Add proper headers to avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }

        resp = requests.get(url, timeout=15, headers=headers)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        # Extract title with multiple fallbacks
        title = ''
        title_selectors = [
            ('meta', {'property': 'og:title'}),
            ('meta', {'name': 'twitter:title'}),
            ('title', {}),
            ('h1', {}),
        ]

        for tag_name, attrs in title_selectors:
            if tag_name == 'title':
                title_tag = soup.find(tag_name)
                if title_tag and title_tag.string:
                    title = title_tag.string.strip()
                    break
            elif tag_name == 'h1':
                h1_tag = soup.find(tag_name)
                if h1_tag and h1_tag.get_text():
                    title = h1_tag.get_text().strip()
                    break
            else:
                title_tag = soup.find(tag_name, attrs=attrs)
                if title_tag and title_tag.get('content'):
                    title = title_tag['content'].strip()
                    break

        # Clean up title (remove site name if present)
        if title:
            # Remove common patterns like " | Site Name" or " - Site Name"
            title = re.sub(r'\s*[|\-–]\s*[^|\-–]*$', '', title)
            title = title.strip()

        # Try multiple ways to get description/excerpt with more fallbacks
        excerpt = ''
        desc_selectors = [
            ('meta', {'property': 'og:description'}),
            ('meta', {'name': 'twitter:description'}),
            ('meta', {'name': 'description'}),
            ('meta', {'name': 'DC.description'}),
            ('meta', {'property': 'article:description'}),
        ]

        for tag_name, attrs in desc_selectors:
            desc_tag = soup.find(tag_name, attrs=attrs)
            if desc_tag and desc_tag.get('content'):
                excerpt = desc_tag['content'].strip()
                break

        # If no meta description found, try to extract from content
        if not excerpt:
            # Try to find the first paragraph with substantial text
            content_selectors = [
                'article p',
                '.content p',
                '.post-content p',
                '.entry-content p',
                'main p',
                'p'
            ]

            for selector in content_selectors:
                paragraphs = soup.select(selector)
                for p in paragraphs:
                    text = p.get_text().strip()
                    if len(text) > 100:  # Only use paragraphs with substantial content
                        excerpt = text[:300] + \
                            '...' if len(text) > 300 else text
                        break
                if excerpt:
                    break

        # Try multiple ways to get author with more fallbacks
        author = ''
        author_selectors = [
            ('meta', {'property': 'article:author'}),
            ('meta', {'name': 'author'}),
            ('meta', {'name': 'twitter:creator'}),
            ('meta', {'property': 'og:author'}),
            ('meta', {'name': 'DC.creator'}),
        ]

        for tag_name, attrs in author_selectors:
            author_tag = soup.find(tag_name, attrs=attrs)
            if author_tag and author_tag.get('content'):
                author = author_tag['content'].strip()
                break

        # If no meta author found, try to find in content
        if not author:
            author_selectors_content = [
                '.author',
                '.byline',
                '.post-author',
                '.entry-author',
                '[rel="author"]',
                '.writer'
            ]

            for selector in author_selectors_content:
                author_elem = soup.select_one(selector)
                if author_elem:
                    author_text = author_elem.get_text().strip()
                    # Clean up author text (remove "By " prefix, etc.)
                    author_text = re.sub(
                        r'^(by\s+|written\s+by\s+)', '', author_text, flags=re.IGNORECASE)
                    if author_text and len(author_text) < 100:  # Sanity check
                        author = author_text
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

        # Try to get thumbnail with more fallbacks and absolute URLs
        thumbnail_url = ''
        thumb_selectors = [
            ('meta', {'property': 'og:image'}),
            ('meta', {'name': 'twitter:image'}),
            ('meta', {'property': 'twitter:image:src'}),
            ('meta', {'name': 'msapplication-TileImage'}),
        ]

        for tag_name, attrs in thumb_selectors:
            thumb_tag = soup.find(tag_name, attrs=attrs)
            if thumb_tag and thumb_tag.get('content'):
                thumb_url = thumb_tag['content'].strip()
                # Convert relative URLs to absolute
                if thumb_url.startswith('//'):
                    thumb_url = 'https:' + thumb_url
                elif thumb_url.startswith('/'):
                    thumb_url = urljoin(url, thumb_url)
                elif not thumb_url.startswith('http'):
                    thumb_url = urljoin(url, thumb_url)
                thumbnail_url = thumb_url
                break

        # If no meta image found, try to find images in content
        if not thumbnail_url:
            img_selectors = [
                'article img[src]',
                '.featured-image img[src]',
                '.post-thumbnail img[src]',
                '.entry-content img[src]',
                'img[src]'
            ]

            for selector in img_selectors:
                img = soup.select_one(selector)
                if img and img.get('src'):
                    img_src = img['src'].strip()
                    # Skip small images (likely icons)
                    width = img.get('width')
                    height = img.get('height')
                    if width and height:
                        try:
                            if int(width) < 100 or int(height) < 100:
                                continue
                        except ValueError:
                            pass

                    # Convert to absolute URL
                    if img_src.startswith('//'):
                        img_src = 'https:' + img_src
                    elif img_src.startswith('/'):
                        img_src = urljoin(url, img_src)
                    elif not img_src.startswith('http'):
                        img_src = urljoin(url, img_src)

                    thumbnail_url = img_src
                    break

        return {
            'title': title or 'Untitled Article',
            'excerpt': excerpt,
            'author': author,
            'published_date': published_date,
            'thumbnail_url': thumbnail_url or DEFAULT_THUMBNAIL
        }

    except requests.exceptions.RequestException as e:
        print(f"Network error extracting metadata from {url}: {str(e)}")
        return {
            'title': 'Unable to Load Article',
            'excerpt': f'Could not fetch content from {url}',
            'author': '',
            'published_date': '',
            'thumbnail_url': DEFAULT_THUMBNAIL
        }
    except Exception as e:
        print(f"Error extracting metadata from {url}: {str(e)}")
        return {
            'title': 'Error Loading Article',
            'excerpt': 'An error occurred while processing this article',
            'author': '',
            'published_date': '',
            'thumbnail_url': DEFAULT_THUMBNAIL
        }
