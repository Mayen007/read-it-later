# Release Process & Roadmap

## v2.3.0 - Visual Enhancement & Browser-Agnostic Positioning

### New Features

- **Premium Visual Authentication**
  - Full-screen login and register images on desktop
  - App-themed decorative elements (folders, article cards, bookmarks, browser tabs, category dots)
  - Subtle gradient backgrounds with reduced opacity decorations
  - Fixed viewport height for elegant no-scroll experience

- **Browser-Agnostic Messaging**
  - Updated Landing page to emphasize universal browser compatibility
  - Changed "Save from Anywhere" to "Works Everywhere" with Globe icon
  - Clear communication: Web app works everywhere, extension is Chrome-only (for now)
  - Added "more browsers coming soon" messaging for extension
  - Transparent about current Chrome-only extension while welcoming all browser users

### Visual Improvements

- Login/Register images fill entire right half (object-cover)
- Decorative elements use category brand colors (blue, green, purple, orange, teal, pink)
- 30% opacity on decorative shapes for better mobile readability
- App-themed doodles: folders, article cards, bookmarks, browser tabs, category clusters
- Responsive breakpoints maintained (single column mobile, split screen desktop)

### UX Enhancements

- Form container scrolls independently on mobile when needed
- Images remain fixed while form scrolls
- Decorative elements don't interfere with form interaction (pointer-events-none)
- Visual hierarchy: form content (z-10) above decorative background shapes

### Technical

- Added login-img.png and register-img.png to frontend/public/
- SVG decorative elements with proper viewBox and path definitions
- Lucide Globe icon for browser-agnostic messaging
- Cleaned up unused icon imports

### Breaking Changes

None - visual enhancements only

## v2.2.0 - Landing Page & Auth UI Enhancement

### New Features

- **Landing Page**
  - Premium landing page for first-time visitors with localStorage tracking
  - Feature grid and "How It Works" section
  - Clear value proposition and CTA sections

- **Enhanced Authentication UI**
  - Two-column layout for Login and Register
  - Gradient backgrounds with messaging
  - Responsive design

### Breaking Changes

None - fully backward compatible

## v2.1.0 - Category Management UI Release

### New Features

- **Complete Category Management Interface**
  - Full CRUD operations: Create, edit, and delete categories
  - Color picker with 10 preset colors for visual organization
  - Inline editing with validation and duplicate prevention
  - Confirmation dialog for safe category deletion
  - Toggle visibility in app header (Tag icon button)

- **Enhanced Article Organization**
  - Multi-select category assignment using react-select dropdown
  - Inline category editing directly on article cards
  - Visual category badges with custom colors
  - Save/Cancel controls for category editing workflow

- **Advanced Filtering**
  - Category filter buttons with colored dot indicators
  - "All Categories" option to clear active filters
  - Category-specific empty states
  - Real-time article filtering by selected category

- **Improved User Experience**
  - Empty state guidance for new users
  - Smooth transitions and hover effects
  - Consistent error handling across all operations
  - Clear visual feedback for all interactions

### Technical Improvements

- Consolidated handleUpdateArticle function (dual-purpose for polling and updates)
- Removed duplicate function declarations
- Enhanced error logging and handling
- Optimized component imports (removed unused dependencies)

### Breaking Changes

None - fully backward compatible with v2.0.0

### Migration

No migration required - all changes are UI enhancements

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
- ✅ Category management UI (Completed in v2.1.0)
- Article highlights and notes
- Improved mobile experience
- Bulk import/export
- Social sharing features
- Reading statistics and analytics
- Dark mode theme
- Export/import categories

---

For full setup, see README.md. For changes, see CHANGELOG.md.
