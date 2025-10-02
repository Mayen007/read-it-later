"""
DEPRECATED: This Netlify Function is no longer used. The backend is now powered by Flask with SQLAlchemy.
All API requests should be directed to the Flask server (see backend/app.py).
"""


def handler(event, context):
    raise RuntimeError(
        "This Netlify Function is deprecated. Use the Flask backend instead.")
