# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a corporate website for 合同会社SHARE (SHARE LLC), a Japanese company specializing in SV (Supervisor), SES (System Engineering Service), Sales Promotion, and Outsourcing businesses. The site is a static HTML/CSS/JavaScript application with PHP backend APIs for content management.

## Running the Development Server

```bash
# Start PHP development server on port 8000
php -S localhost:8000
```

Access the site at `http://localhost:8000`

## Architecture

### Content Management System

The site uses a JSON-based CMS with PHP APIs for CRUD operations:

**News Management:**
- Data: `data/news.json` - stores all news articles
- API: `api/save-news.php`, `api/delete-news.php`, `api/upload-image.php`
- Frontend: `news.html` (list), `news-detail.html` (detail)
- Loaders: `js/news-loader.js`, `js/index-news-loader.js`, `js/news-detail-loader.js`

**Interview Management:**
- Data: `data/interviews.json` - stores staff interview articles
- API: `api/interview-manager.php` (handles upload, save, delete with `?action=` parameter)
- Frontend: `interview.html` (list), `interview-detail.html` (detail)
- Loaders: `js/interview-loader.js`, `js/index-interview-loader.js`, `js/interview-detail-loader.js`

**Admin Panel:**
- `admin.html` - unified admin interface with tab system for News and Interview management
- `js/admin-manager.js` - handles all admin operations including image uploads and JSON data persistence
- `css/admin.css` - admin-specific styling
- Password: `admin2017` (hardcoded in PHP APIs)

### Image Upload System

Images are uploaded via PHP and stored in: `assets/uploads/YYYY/MM/filename.ext`

Upload flow:
1. Frontend sends FormData with image file to PHP API
2. PHP validates file type (jpg, jpeg, png, gif, webp) and size (max 5MB)
3. PHP creates year/month directory structure
4. PHP generates unique filename: `timestamp_uniqid.ext`
5. Returns relative path: `./assets/uploads/YYYY/MM/filename.ext`

### Hero Section with 3D Background

The homepage features a dynamic 3D wireframe background using Three.js:

- `js/hero-3d.js` - main implementation with day/night cycle
- `css/hero-3d.css` - styling for 3D canvas and overlays
- Day/night transition based on scroll position
- Text color automatically switches at threshold 0.5
- Camera movement responds to mouse position and time-based animation

### Page Structure

**Main Pages:**
- `index.html` - Homepage with hero, business sections, news ticker, interview showcase
- `company.html` - Company information, representative message, history, access
- `service.html` - Services overview (SV, SES, Sales Promotion, Outsourcing)
- `interview.html` - Staff interview list page
- `news.html` - News list page with pagination
- `recruit.html` - Recruitment information
- `contact.html` - Contact form

**Dynamic Detail Pages:**
- `interview-detail.html?id=X` - Interview detail loaded from JSON
- `news-detail.html?id=X` - News detail loaded from JSON

### Styling Architecture

The CSS is modular and page-specific:

**Core Styles:**
- `css/style-complete.css` - base reset and common styles
- `css/block-sections.css` - section block layouts
- `css/footer-custom.css` - unified footer design

**Page-Specific:**
- `css/index-interview-section.css` - index page interview cards
- `css/interview-section.css` - interview list page styling
- `css/news-section.css` - news list styling
- `css/business-section.css` - business section cards
- `css/hero-*.css` - various hero section styles

**Component-Specific:**
- `css/header-sticky.css`, `css/header-always-visible.css` - header behavior
- `css/header-subpages.css` - subpage header styling
- `css/admin.css` - admin panel styling

### Design System

**Colors:**
- Primary black: `#252525`
- Secondary gray: `#636363`
- Light gray: `#e0e0e0`
- Accent yellow: `#f1d252`
- White: `#ffffff`

**Design Principles:**
- No gradients or shadows (clean, flat design)
- Borders only: `1px solid #252525` or `#e0e0e0`
- No border-radius (sharp corners)
- Hover states: border color changes only
- Typography: Noto Sans JP + Adobe Typekit (proxima-nova, ryo-gothic-plusn, acumin-pro)

### JavaScript Organization

**Core Libraries:**
- jQuery 3.7.1 (bundled in `js/vendor.js`)
- Slick Slider
- Three.js (for 3D background)

**Configuration:**
- `js/config.js` - central config for animations, sliders, breakpoints

**Page Scripts:**
- `js/main.js` - hamburger menu, sliders, facility tabs
- `js/business-slider.js` - business section carousel
- `js/header-sticky.js`, `js/header-subpages.js` - header behavior

### Data Structure

**News Article:**
```json
{
  "id": 1,
  "date": "2025.10.02",
  "timestamp": "2025-10-02T17:59:34",
  "category": "お知らせ",
  "title": "タイトル",
  "content": "本文（200文字まで一覧表示）",
  "image": "./assets/uploads/YYYY/MM/filename.jpg",
  "isNew": true
}
```

**Interview Article:**
```json
{
  "id": 1,
  "title": "インタビュータイトル",
  "staffName": "山田太郎",
  "position": "スーパーバイザー",
  "joinDate": "2020年・新卒入社",
  "labels": ["SV事業", "新卒"],
  "content": "インタビュー本文",
  "image": "./assets/uploads/YYYY/MM/filename.jpg",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

## Key Implementation Details

### Dynamic Content Loading

All news and interview content is loaded dynamically from JSON files using fetch API. The loaders handle:
- Fetching JSON data
- Sorting by date (newest first)
- Rendering HTML templates
- Error handling with fallback messages

### Admin Panel Tab System

The admin panel uses a simple tab system in `admin-manager.js`:
- Tab buttons have `data-tab` attribute matching content div IDs
- Click handler switches active classes on tabs and content
- Forms submit to appropriate PHP APIs based on active tab

### Image Display in Lists

**News List (`news.html`):**
- Horizontal layout: image (280px width) on left, content on right
- Image container has 30px padding with `object-fit: contain`
- Text truncated to 200 characters with "..."

**Interview List (`interview.html`):**
- Vertical layout: image (420px height) on top, content below
- Card width: 380px in grid layout
- Labels displayed as bordered tags over image

### Responsive Behavior

Mobile breakpoint: `768px`

On mobile:
- News cards switch to vertical layout
- Interview cards: single column grid
- Hero 3D effects remain but simplified
- Navigation becomes hamburger menu

## Common Modifications

### Adding a New News Article

1. Access `admin.html` in browser
2. Enter password: `admin2017`
3. Select "お知らせ管理" tab
4. Fill out form (title, date, category, content, optional image)
5. Click save - data persists to `data/news.json`

### Adding a New Interview

1. Access `admin.html` → "社員インタビュー管理" tab
2. Fill out form (title, staff name, position, join date, labels, content, image)
3. Image is required for interviews
4. Data saves to `data/interviews.json`

### Modifying Hero Day/Night Transition

Edit `js/hero-3d.js`:
- Transition threshold: line ~1026 `if (dayNightValue > 0.5)`
- Text colors: `textBrightness = 51` (dark) or `255` (white)
- Background colors defined in `updateDayNightCycle()` function

### Styling Adjustments

When modifying styles, maintain consistency:
- Use existing color variables from design system
- Avoid adding shadows, gradients, or border-radius
- Keep border widths at 1px
- Hover effects should only change border colors
- Maintain padding consistency (20px, 30px standard)

## File Upload Restrictions

- Allowed types: JPEG, PNG, GIF, WebP
- Max size: 5MB
- Storage path: `assets/uploads/YYYY/MM/`
- Filename format: `timestamp_uniqid.ext`

## Company Information

- Company: 合同会社SHARE
- Representative: 佐藤　一斗
- COO: 渡邊　隆太郎
- Address: 〒110-0015 東京都台東区東上野６丁目２３−５ 第二雨宮ビル1002
- Phone: 048-961-8663
- Mobile: 090-6684-7792 / 090-1828-5970
- Email: info@share-llc.jp
