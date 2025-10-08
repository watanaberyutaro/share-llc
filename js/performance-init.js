// Performance Initialization Script
(function() {
    'use strict';

    // Lazy load images with Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Convert existing images to lazy load
        document.addEventListener('DOMContentLoaded', function() {
            const images = document.querySelectorAll('img:not([loading="lazy"])');
            images.forEach(img => {
                if (img.complete) return;

                // Skip critical above-fold images
                const rect = img.getBoundingClientRect();
                if (rect.top < window.innerHeight) return;

                // Set up lazy loading
                if (img.src && !img.dataset.src) {
                    img.dataset.src = img.src;
                    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
                    imageObserver.observe(img);
                }
            });
        });
    }

    // Defer non-critical CSS
    function loadDeferredStyles() {
        const links = document.querySelectorAll('link[data-defer]');
        links.forEach(link => {
            link.removeAttribute('data-defer');
            link.rel = 'stylesheet';
        });
    }

    // Load deferred styles after page load
    if (window.requestIdleCallback) {
        requestIdleCallback(loadDeferredStyles);
    } else {
        setTimeout(loadDeferredStyles, 100);
    }

    // Optimize scroll events with passive listeners
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach(element => {
        element.addEventListener('scroll', () => {}, { passive: true });
    });

    // Reduce layout thrashing
    let resizeTimer;
    window.addEventListener('resize', function() {
        document.body.classList.add('resize-animation-stopper');
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.body.classList.remove('resize-animation-stopper');
        }, 400);
    }, { passive: true });

    // Add CSS for resize animation stopper
    const style = document.createElement('style');
    style.textContent = `
        .resize-animation-stopper * {
            animation: none !important;
            transition: none !important;
        }
    `;
    document.head.appendChild(style);

    // Optimize touch events on mobile
    if ('ontouchstart' in window) {
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchmove', function() {}, { passive: true });
    }

    // Prefetch internal links on hover
    const prefetchLinks = new Set();
    document.addEventListener('mouseover', function(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || prefetchLinks.has(href)) return;

        prefetchLinks.add(href);
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = href;
        document.head.appendChild(prefetchLink);
    }, { passive: true });

    // Clean up memory on page unload
    window.addEventListener('beforeunload', function() {
        // Cancel all pending animations
        const animations = document.getAnimations();
        animations.forEach(animation => animation.cancel());

        // Clear all timers
        let id = setTimeout(function() {}, 0);
        while (id--) {
            clearTimeout(id);
        }
    });

})();