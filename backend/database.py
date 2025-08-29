import sqlite3


def init_db():
    conn = sqlite3.connect('articles.db')
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE NOT NULL,
            title TEXT,
            excerpt TEXT,
            author TEXT,
            published_date TEXT,
            saved_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            tags TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            thumbnail_url TEXT
        )
    ''')
    conn.commit()
    conn.close()


if __name__ == '__main__':
    init_db()
