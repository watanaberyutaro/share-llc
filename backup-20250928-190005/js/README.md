# JavaScript Organization for SHARE Website

This directory contains the organized JavaScript files extracted from the WordPress website and optimized for standalone use.

## File Structure

### `vendor.js`
Contains all third-party libraries:
- **jQuery 3.7.1** - Core DOM manipulation and AJAX library
- **Slick Slider** - Responsive carousel/slider functionality
- **Lightbox** - Image gallery modal functionality
- **Object-fit-images polyfill** - CSS object-fit support for older browsers

### `config.js`
Central configuration file containing:
- Animation settings (intervals, speeds)
- Slider configurations
- Responsive breakpoints
- Feature flags
- Debug mode toggle

### `main.js`
Main application functionality:
- Hamburger menu navigation
- Responsive menu handling
- Slick slider initialization
- Background slide animations
- Facility tab functionality
- Text node optimization
- Component initialization

### `search.js`
Search and filter functionality:
- Client-side search and filtering
- Form handling
- Result display management
- Fallback for non-jQuery environments

## Usage

### Basic Implementation
```html
<!-- Include in this order -->
<script src="./js/config.js"></script>
<script src="./js/vendor.js"></script>
<script src="./js/main.js"></script>
<script src="./js/search.js"></script>
```

### Configuration
Modify `config.js` to customize:
```javascript
window.SiteConfig = {
    animations: {
        flipInterval: 2500,      // Animation flip speed
        backgroundSlideInterval: 1700,  // Background change speed
        fadeSpeed: 300           // Fade animation speed
    },
    features: {
        enableSlider: true,      // Enable/disable sliders
        enableLightbox: true,    // Enable/disable lightbox
        enableSearch: true,      // Enable/disable search
        enableAnimations: true   // Enable/disable animations
    },
    debug: false                 // Enable debug logging
};
```

## Features

### Responsive Navigation
- Mobile hamburger menu
- Collapsible sub-menus
- Auto-responsive behavior

### Image Sliders
- Horizontal belt slider with continuous scroll
- Vertical business image slider
- Mobile-responsive configurations

### Interactive Components
- Facility tabs with content switching
- Smooth animations and transitions
- Background image slideshows

### Search & Filter
- Client-side filtering system
- Real-time results updating
- Graceful degradation without dependencies

## Browser Support
- Modern browsers (ES6+)
- IE11+ (with polyfills included)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies
- jQuery 3.7.1 (included in vendor.js)
- Modern browser with JavaScript enabled

## Customization
All major functionality is configurable through `config.js`. Animation speeds, feature toggles, and responsive breakpoints can be adjusted without modifying the core JavaScript files.

## Performance Notes
- Images are lazy-loaded automatically
- Libraries are bundled for minimal HTTP requests
- Responsive features adapt to screen size changes
- Graceful fallbacks for missing dependencies