/**
 * Search and Filter Functionality
 * Cleaned version without WordPress dependencies
 */

jQuery(document).ready(function ($) {

    // Simple client-side search and filter functionality
    function performClientSearch() {
        let activeFilters = {};

        // Collect active filters
        $('#search-filter input:checked').each(function () {
            let name = $(this).attr('name');
            let value = $(this).val();

            if (name.endsWith('[]')) {
                name = name.slice(0, -2);
                if (!activeFilters[name]) {
                    activeFilters[name] = [];
                }
                activeFilters[name].push(value);
            } else {
                activeFilters[name] = value;
            }
        });

        // Filter results
        filterResults(activeFilters);
    }

    function filterResults(filters) {
        const resultBoxes = $('.result-box');
        let visibleCount = 0;

        // フェードアウトアニメーション
        const fadeSpeed = window.SiteConfig ? window.SiteConfig.animations.fadeSpeed : 300;
        $('#search-results').fadeOut(fadeSpeed, function () {

            resultBoxes.each(function () {
                const $item = $(this);
                let shouldShow = true;

                // Apply filters based on data attributes
                Object.keys(filters).forEach(filterName => {
                    const filterValue = filters[filterName];
                    const itemValue = $item.data(filterName);

                    if (Array.isArray(filterValue)) {
                        if (filterValue.length > 0 && !filterValue.includes(itemValue)) {
                            shouldShow = false;
                        }
                    } else if (filterValue && itemValue !== filterValue) {
                        shouldShow = false;
                    }
                });

                if (shouldShow) {
                    $item.show();
                    visibleCount++;
                } else {
                    $item.hide();
                }
            });

            // Update result count
            $('#result-count').text(visibleCount);

            // Show results with no matches message if needed
            if (visibleCount === 0) {
                if (!$('#no-results').length) {
                    $('#search-results').append('<p id="no-results">該当する求人はありません。</p>');
                }
            } else {
                $('#no-results').remove();
            }

            $('#search-results').fadeIn(fadeSpeed);
        });
    }

    // Reset filters
    function resetFilters() {
        $('#search-filter input').prop('checked', false);
        $('.result-box').show();
        $('#result-count').text($('.result-box').length);
        $('#no-results').remove();
    }

    // Initialize search functionality
    function initializeSearch() {
        // Initial count
        const totalResults = $('.result-box').length;
        $('#result-count').text(totalResults);

        // Filter change events
        $('#search-filter input').on('change', performClientSearch);

        // Reset button
        $('#reset-filters').on('click', resetFilters);

        // Text search if available
        $('#search-text').on('input', function () {
            const searchTerm = $(this).val().toLowerCase();

            $('.result-box').each(function () {
                const $item = $(this);
                const text = $item.text().toLowerCase();

                if (searchTerm === '' || text.includes(searchTerm)) {
                    $item.addClass('text-match');
                } else {
                    $item.removeClass('text-match').hide();
                }
            });

            performClientSearch();
        });
    }

    // Form submission handling
    $('.search form').on('submit', function (e) {
        e.preventDefault();
        performClientSearch();
    });

    // Initialize when DOM is ready
    initializeSearch();
});

// Fallback for non-jQuery environments
if (typeof jQuery === 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.warn('Search functionality requires jQuery. Please include jQuery library.');

        // Basic vanilla JS fallback for simple filtering
        const filterInputs = document.querySelectorAll('#search-filter input');
        const resultBoxes = document.querySelectorAll('.result-box');

        filterInputs.forEach(input => {
            input.addEventListener('change', function() {
                // Simple show/hide based on checked state
                // This is a basic fallback - full functionality requires jQuery
                console.log('Filter changed:', this.name, this.value, this.checked);
            });
        });
    });
}