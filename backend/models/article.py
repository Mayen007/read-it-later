class Article:
    def __init__(self, id, url, title, excerpt, author, published_date, saved_date, tags, is_read, thumbnail_url):
        self.id = id
        self.url = url
        self.title = title
        self.excerpt = excerpt
        self.author = author
        self.published_date = published_date
        self.saved_date = saved_date
        self.tags = tags
        self.is_read = is_read
        self.thumbnail_url = thumbnail_url
