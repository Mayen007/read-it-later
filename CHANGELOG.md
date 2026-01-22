# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-01-22

### Added

- **Category Management UI**
  - CategoryManager component with full CRUD operations (create, edit, delete)
  - Color picker with 10 preset colors for visual organization
  - Inline category editing directly from article cards
  - Delete confirmation dialog to prevent accidental deletions
  - Empty state guidance for new users

- **Category Filtering**
  - Category filter buttons in ArticleFilters component with color indicators
  - "All Categories" button to clear active filters
  - Category-specific empty states with "Clear Category Filter" option
  - Real-time filtering of articles by selected category

- **Article Category Assignment**
  - Multi-select dropdown using react-select for assigning categories to articles
  - Save/Cancel buttons for inline category editing on article cards
  - Visual category badges with custom colors on article cards
  - "No categories" empty state on articles without category assignments

- **UI/UX Improvements**
  - Toggle button in app header to show/hide CategoryManager (Tag icon)
  - Smooth transitions and hover effects on category elements
  - Error handling with try-catch blocks for all category operations
  - Consistent styling across category UI components

### Changed

- Enhanced ArticleCard component with inline category editing capability
- Updated ArticlesList to support category-based filtering
- Improved empty states throughout the application for better user guidance
- Consolidated handleUpdateArticle function to support both polling and manual updates

### Fixed

- Removed duplicate handleUpdateArticle function declaration
- Removed unused imageOptimization imports from ArticleCard
- Enhanced error logging in AddArticleForm component

## [2.0.0] - 2025-12-11

### Added

- **User Authentication System**
  - JWT-based authentication with access tokens (15-minute expiry) and refresh tokens (7-day expiry)
  - User registration endpoint (`POST /api/auth/register`) with password validation
  - User login endpoint (`POST /api/auth/login`)
  - Token refresh endpoint (`POST /api/auth/refresh`)
  - User model with email validation and unique constraints
  - bcrypt password hashing with 12 salt rounds

- **Security Features**
  - Rate limiting on authentication endpoints (5 attempts per 15 minutes per IP)
  - Password requirements: minimum 8 characters, uppercase letter, number, special character
  - JWT middleware for route protection
  - CORS whitelist configuration (production + localhost + chrome-extension origins)
  - Environment variables for token secrets

- **Multi-User Support**
  - User-scoped articles and categories
  - Automatic data isolation between users
  - First registered user migration (silently claims existing articles/categories)
  - User-specific queries with `user_id` filtering

- **Frontend Authentication**
  - AuthContext provider for global authentication state
  - Login component with form validation and error handling
  - Register component with password requirements display
  - Automatic token refresh on 401 errors with retry logic
  - Token validation on app load (auto-clears invalid tokens)
  - User icon in header (replaces email display)
  - Logout functionality

- **Chrome Extension Authentication**
  - Authentication UI in extension popup (login/register forms)
  - Token storage in `chrome.storage.local`
  - Authenticated API requests with Bearer tokens
  - Automatic token refresh on 401 errors
  - Session expiry handling with re-authentication prompt
  - Toggle between login and register modes

### Changed

- **Breaking**: All `/api/articles` endpoints now require authentication
- **Breaking**: All `/api/categories` endpoints now require authentication
- Updated Article model to include `user_id` field (ObjectId reference, indexed)
- Updated Category model to include `user_id` field (ObjectId reference, indexed)
- Modified CORS configuration to use dynamic origin validation with whitelist
- Enhanced API interceptor to exclude `/auth/` endpoints from token refresh logic
- Improved error handling with specific authentication error responses

### Fixed

- Removed duplicate schema index warning in User model
- Fixed React Fast Refresh warning by separating AuthContext, useAuth hook, and provider
- Fixed React Hooks violation by moving all hooks before conditional returns
- Fixed API interceptor attempting refresh on authentication endpoints
- Added missing `storage` permission to Chrome extension manifest
- Fixed async/await handling in extension popup for token operations

### Security

- Passwords are hashed with bcrypt (12 rounds) before storage
- JWT tokens signed with separate secrets for access and refresh
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Rate limiting prevents brute force attacks on auth endpoints
- CORS restricted to whitelisted origins only

## [1.5.0] - 2025-11-20

### Added

- Category management system
- Assign articles to categories
- Filter articles by category
- Category CRUD operations

## [1.0.0] - 2025-11-09

### Added

- Migrated to MERN stack (MongoDB, Express, React, Node.js)
- Chrome extension for saving articles from browser
- Article CRUD: add, mark as read, delete
- Search and filter articles
- Responsive design for desktop and mobile
- Automatic metadata extraction for articles
- Improved error handling and loading states
- Modern UI with Tailwind CSS v4
- Backend API with Express 5 and Mongoose 8

[2.1.0]: https://github.com/Mayen007/read-it-later/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/Mayen007/read-it-later/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/Mayen007/read-it-later/compare/v1.0.0...v1.5.0
[1.0.0]: https://github.com/Mayen007/read-it-later/releases/tag/v1.0.0
