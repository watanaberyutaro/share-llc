/**
 * Application Configuration
 * Centralized configuration for the standalone website
 */

window.SiteConfig = {
    // Animation settings
    animations: {
        flipInterval: 2500,
        backgroundSlideInterval: 1700,
        fadeSpeed: 300
    },

    // Slider settings
    sliders: {
        belt: {
            autoplay: true,
            autoplaySpeed: 0,
            speed: 5000,
            cssEase: 'linear',
            slidesToShow: 3,
            swipe: false,
            arrows: false,
            pauseOnFocus: false,
            pauseOnHover: false,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                    },
                },
            ],
        },
        business: {
            vertical: true,
            autoplay: true,
            autoplaySpeed: 3000,
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: false,
            draggable: false,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        vertical: false,
                        fade: true,
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        }
    },

    // Responsive breakpoints
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
    },

    // Feature flags
    features: {
        enableSlider: true,
        enableLightbox: true,
        enableObjectFit: true,
        enableSearch: true,
        enableAnimations: true
    },

    // Debug mode
    debug: false,

    // Initialize features based on availability
    init: function() {
        // Check if libraries are loaded
        this.features.enableSlider = this.features.enableSlider && (typeof jQuery !== 'undefined' && typeof jQuery.fn.slick !== 'undefined');
        this.features.enableLightbox = this.features.enableLightbox && (typeof lightbox !== 'undefined');
        this.features.enableObjectFit = this.features.enableObjectFit && (typeof objectFitImages !== 'undefined');

        if (this.debug) {
            console.log('Site Configuration:', this);
        }
    }
};

// Auto-initialize when config is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.SiteConfig.init();
    });
} else {
    window.SiteConfig.init();
}