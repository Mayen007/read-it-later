# Read It Later

A full-stack web application to save and organize articles for later reading, built with Flask backend, React frontend, and a Chrome extension.

## Features

- 📝 **Save Articles**: Add articles by URL with automatic metadata extraction
- 🔍 **Search & Filter**: Search through saved articles and filter by read/unread status
- ✅ **Mark as Read**: Track your reading progress
- 🗑️ **Delete Articles**: Remove articles you no longer need
- 🌐 **Chrome Extension**: Save current page directly from your browser
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
read-it-later/
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application
│   ├── routes/             # API routes
│   ├── models/             # Data models
│   ├── services/           # Business logic
│   └── requirements.txt    # Python dependencies
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── package.json        # Node.js dependencies
└── extension/              # Chrome extension
    ├── manifest.json       # Extension manifest
    ├── popup.html         # Extension popup
    └── popup.js           # Extension logic
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Chrome browser (for extension)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database:

   ```bash
   python database.py
   ```

5. Start the Flask server:
   ```bash
   python app.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` directory
4. The extension will appear in your browser toolbar

## API Endpoints

- `GET /api/articles` - Get all articles
- `POST /api/articles` - Add a new article
- `PUT /api/articles/:id` - Update article (mark as read/unread)
- `DELETE /api/articles/:id` - Delete article

## Technologies Used

### Backend

- **Flask**: Python web framework
- **SQLite**: Database for storing articles
- **Flask-CORS**: Cross-origin resource sharing
- **BeautifulSoup4**: Web scraping for metadata extraction
- **Requests**: HTTP library for fetching web pages

### Frontend

- **React**: JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API requests
- **Lucide React**: Icon library
- **date-fns**: Date utility library

### Extension

- **Manifest V3**: Latest Chrome extension API
- **Chrome APIs**: For browser integration

## Development

### Running in Development Mode

1. Start the backend server (port 5000)
2. Start the frontend development server (port 3000)
3. Load the Chrome extension in developer mode

The Vite development server is configured with a proxy to forward API requests to the backend.

### Building for Production

Frontend:

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
