# Read It Later

A full-stack web application to save and organize articles for later reading, built with a MERN backend (MongoDB, Express, React, Node.js) and a Chrome extension.

## Features

- 🔐 **User Authentication**: Secure JWT-based login and registration with multi-user support
- 📝 **Save Articles**: Add articles by URL with automatic metadata extraction
- 🔍 **Search & Filter**: Search through saved articles and filter by read/unread status
- ✅ **Mark as Read**: Track your reading progress
- 🗑️ **Delete Articles**: Remove articles you no longer need
- 🌐 **Chrome Extension**: Save current page directly from your browser with authenticated requests
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Token Refresh**: Automatic access token refresh for seamless user experience

## Project Structure

```
read-it-later/
├── backend/                 # Express + MongoDB API server
│   ├── server.js           # Main Express application
│   ├── routes/             # API routes
│   ├── models/             # Mongoose data models
│   ├── services/           # Business logic
│   └── package.json        # Node.js dependencies
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

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Chrome browser (for extension)

### Backend Setup (Express + MongoDB)

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your `.env` file:

   ```env
   MONGODB_URI=your-mongodb-uri
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ACCESS_TOKEN_SECRET=your-secret-key-change-in-production
   REFRESH_TOKEN_SECRET=your-refresh-secret-key-change-in-production
   ```

   **Security Note**: Generate strong random secrets for production using:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup (React)

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
5. Sign in with your credentials to start saving articles
6. For production, update the `API_BASE_URL` in `background.js` and `popup.js` to your deployed backend URL.

**Note**: The extension stores authentication tokens in `chrome.storage.local` and automatically refreshes expired tokens.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive tokens
- `POST /api/auth/refresh` - Refresh access token

### Articles (Protected)

- `GET /api/articles` - Get all articles for authenticated user
- `POST /api/articles` - Add a new article
- `PUT /api/articles/:id` - Update article (mark as read/unread)
- `DELETE /api/articles/:id` - Delete article

### Categories (Protected)

- `GET /api/categories` - Get all categories for authenticated user
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Technologies Used

### Backend

- **Express.js**: Node.js web framework
- **MongoDB (Atlas)**: Cloud database for storing articles and users
- **Mongoose**: MongoDB ODM for schema and queries
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcrypt**: Password hashing and security
- **express-rate-limit**: Rate limiting for auth endpoints
- **CORS**: Cross-origin resource sharing with whitelist
- **Cheerio**: Web scraping for metadata extraction
- **Axios**: HTTP library for fetching web pages

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

The Vite development server is configured with a proxy to forward `/api` requests to the backend.

### Building for Production

#### Backend

Deploy the backend to Render, Railway, or Heroku. Set your environment variables (`MONGODB_URI`, `PORT`, `CLIENT_URL`).

#### Frontend

Deploy the frontend to Netlify or Vercel. Set `VITE_API_URL` in your environment to your backend API URL.

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

#### Extension

Update API and frontend URLs in `background.js` and `popup.js` to your live deployment URLs. Zip the `extension/` folder and upload to the Chrome Web Store.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
