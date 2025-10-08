// Scroll Animations - Automatic element detection and animation
(function() {
    'use strict';

    // Animation configuration
    const config = {
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before element enters viewport
        threshold: 0.1 // 10% of element must be visible
    };

    // Create IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optionally unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, config);

    // Initialize animations
    function initScrollAnimations() {
        // Title selectors - h1, h2, h3 that are not in header/nav
        const titles = document.querySelectorAll('main h1, main h2, main h3, section h1, section h2, section h3');

        // Content selectors
        const contentSelectors = [
            'main p:not(.animate-title)',
            'main .block-content > div',
            'main .message-content',
            'main .message-image',
            'main .message-text',
            'main .ceo-info',
            'main table',
            'main .timeline-item',
            'main .access-info',
            'main .map-container',
            'main .company-info-table',
            'main .values-grid .value-item',
            'main .benefits-grid .benefit-card',
            'main .position-card',
            'main .process-step',
            'main .faq-item',
            'main .recruit-cta',
            'main .interview-message',
            'main .col',
            'main .news-card',
            'main form',
            'main .contact-info-box'
        ];

        // Apply animation classes to titles
        titles.forEach((title, index) => {
            // Skip if already has animation class
            if (title.classList.contains('animate-on-scroll') ||
                title.classList.contains('animate-title')) {
                return;
            }

            title.classList.add('animate-title');

            // Add slight delay for sequential titles
            if (index > 0) {
                const delay = Math.min(index, 3); // Max delay of 3
                title.classList.add(`animate-delay-${delay}`);
            }

            observer.observe(title);
        });

        // Apply animation classes to content elements
        const allContent = document.querySelectorAll(contentSelectors.join(', '));
        allContent.forEach((element, index) => {
            // Skip if already has animation class
            if (element.classList.contains('animate-on-scroll') ||
                element.classList.contains('animate-content') ||
                element.classList.contains('animate-title')) {
                return;
            }

            // Check if it's an image container
            if (element.classList.contains('message-image') ||
                element.querySelector('img')) {
                element.classList.add('animate-image');
            } else {
                element.classList.add('animate-content');
            }

            observer.observe(element);
        });

        // Special handling for grid items (staggered animation)
        const gridContainers = document.querySelectorAll('.values-grid, .benefits-grid, .interview-col');
        gridContainers.forEach(container => {
            const items = container.children;
            Array.from(items).forEach((item, index) => {
                if (!item.classList.contains('animate-on-scroll') &&
                    !item.classList.contains('animate-content')) {
                    item.classList.add('animate-content');

                    // Stagger animation
                    const delay = (index % 3) + 1; // Cycle through delays 1-3
                    item.classList.add(`animate-delay-${delay}`);

                    observer.observe(item);
                }
            });
        });

        // Images within content
        const contentImages = document.querySelectorAll('main img:not(.animate-image)');
        contentImages.forEach(img => {
            const parent = img.closest('.animate-content, .animate-image, .animate-title');
            if (!parent) {
                const wrapper = img.parentElement;
                if (wrapper && !wrapper.classList.contains('animate-on-scroll')) {
                    wrapper.classList.add('animate-image');
                    observer.observe(wrapper);
                }
            }
        });
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }

    // Re-run after dynamic content is loaded (with delay)
    setTimeout(initScrollAnimations, 1000);
})();
