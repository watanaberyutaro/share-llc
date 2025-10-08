// Header sticky functionality for INDEX page only
document.addEventListener('DOMContentLoaded', function() {
    // Only run on index page (not subpages)
    if (document.body.classList.contains('page-subpage')) {
        return;
    }

    const header = document.querySelector('header.commonHeader');
    if (!header) return;

    let headerOffset = header.offsetTop;

    // Make header sticky on scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > headerOffset) {
            header.classList.add('is-sticky');
        } else {
            header.classList.remove('is-sticky');
        }
    });

    // Mobile navigation toggle
    const navToggle = document.querySelector('.navToggle');
    const headerNav = document.querySelector('.header-nav');

    if (navToggle && headerNav) {
        navToggle.addEventListener('click', function() {
            headerNav.classList.toggle('show');
            this.classList.toggle('active');
        });
    }

    // Dropdown menu functionality
    const dropdowns = document.querySelectorAll('.header-nav .parent');
    dropdowns.forEach(function(dropdown) {
        dropdown.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                this.classList.add('open');
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                this.classList.remove('open');
            }
        });

        // Mobile: click to toggle
        const parentSpan = dropdown.querySelector('span');
        if (parentSpan) {
            parentSpan.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdown.classList.toggle('open');
                }
            });
        }
    });
});
