// Page Transition Loading Animation
(function() {
    'use strict';

    // Configuration
    const LOADING_DURATION = 2000; // 2 seconds
    const FADE_OUT_DURATION = 400; // 0.4 seconds

    // Get loading element
    const loadingElement = document.getElementById('page-transition-loading');

    if (!loadingElement) {
        console.error('Loading element not found');
        return;
    }

    // Hide loading
    function hideLoading() {
        loadingElement.classList.add('hidden');

        // Remove from display after fade out
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, FADE_OUT_DURATION);
    }

    // Show loading (for navigation)
    function showLoading() {
        loadingElement.classList.remove('hidden');
        loadingElement.style.display = 'flex';

        // Auto hide after duration
        setTimeout(() => {
            hideLoading();
        }, LOADING_DURATION);
    }

    // Hide loading after duration on page load
    setTimeout(() => {
        hideLoading();
    }, LOADING_DURATION)

    // Optional: Show loading when clicking internal links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href) {
            const url = new URL(link.href, window.location.href);

            // Only show for internal links to different pages
            if (url.origin === window.location.origin &&
                url.pathname !== window.location.pathname &&
                !link.target &&
                !link.hasAttribute('download')) {

                // Show loading before navigation
                showLoading();
            }
        }
    });

    // Handle browser back/forward buttons
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // Page loaded from cache
            hideLoading();
        }
    });
})();
