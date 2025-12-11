# Release Process & Roadmap

## v2.0.0 - Authentication Release

### New Features

- Multi-user authentication with JWT tokens
- Secure user registration and login
- Password validation (8+ chars, uppercase, number, special character)
- Rate limiting on auth endpoints (5 attempts per 15 minutes)
- Automatic token refresh (15-minute access tokens, 7-day refresh tokens)
- User-scoped articles and categories
- Chrome extension authentication support
- First user migration for existing data

### Breaking Changes

- All API endpoints now require authentication
- Chrome extension requires sign-in
- Articles and categories are now user-specific

### Security

- bcrypt password hashing (12 rounds)
- JWT token-based authentication
- CORS whitelist (production + localhost + chrome-extension)
- Rate limiting on authentication endpoints

### Migration

- First registered user automatically claims all existing articles and categories
- No manual migration required

## v1.0.0 Release Steps

1. Update all dependencies and code for stability
2. Set version to 1.0.0 in package.json (frontend & backend)
3. Create and update CHANGELOG.md
4. Commit, tag, and push to GitHub
5. Draft release notes on GitHub

## Deployment Instructions

- **Backend**: Deploy Express server to Render, Heroku, or similar
- **Frontend**: Deploy React app to Netlify or Vercel
- **MongoDB**: Use MongoDB Atlas or local instance
- **Chrome Extension**: Load unpacked from `extension/` in Chrome

## Future Roadmap

- ✅ User authentication (Completed in v2.0.0)
- ✅ Categories/tags support (Completed in v1.5.0)
- Article highlights and notes
- Improved mobile experience
- Bulk import/export
- Social sharing features
- Reading statistics and analytics
- Dark mode theme

---

For full setup, see README.md. For changes, see CHANGELOG.md.
