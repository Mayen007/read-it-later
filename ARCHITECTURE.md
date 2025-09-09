# Read-it-Later - Simplified Architecture

## Frontend (React + Vite)

- Single-page application
- Direct API calls to backend
- Clean, simple UI

## Backend (Single Netlify Function)

- One function handles all article operations
- Direct database operations (no ORM)
- Minimal dependencies
- Clear error handling

## Database (Neon PostgreSQL)

- Simple articles table
- Direct SQL queries
- No complex relationships

## Browser Extension

- Minimal popup
- Direct API integration
- One-click save functionality
