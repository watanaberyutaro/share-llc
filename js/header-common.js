// Common Header Functionality
// Works on all pages (index and sub pages)

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header.commonHeader');
    const navToggle = document.querySelector('.navToggle');
    const headerNav = document.querySelector('.header-nav');
    
    if (!header) return;

    // Header scroll behavior
    let prevY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const currentY = window.scrollY;
                
                // Show header when scrolling up, hide when scrolling down
                if (currentY < prevY || currentY < 100) {
                    header.classList.remove('hidden');
                } else if (currentY > 100) {
                    header.classList.add('hidden');
                }
                
                prevY = currentY;
                ticking = false;
            });
            ticking = true;
        }
    });

    // Mobile navigation toggle
    if (navToggle && headerNav) {
        navToggle.addEventListener('click', function() {
            headerNav.classList.toggle('show');
            this.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!header.contains(e.target) && headerNav.classList.contains('show')) {
                headerNav.classList.remove('show');
                navToggle.classList.remove('active');
                document.body.classList.remove('nav-open');
            }
        });

        // Close menu when clicking a link
        const navLinks = headerNav.querySelectorAll('a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    headerNav.classList.remove('show');
                    navToggle.classList.remove('active');
                    document.body.classList.remove('nav-open');
                }
            });
        });
    }

    // Dropdown hover behavior (desktop only)
    const dropdowns = document.querySelectorAll('.header-nav .parent');
    dropdowns.forEach(function(dropdown) {
        let timeout;
        
        dropdown.addEventListener('mouseenter', function() {
            clearTimeout(timeout);
            if (window.innerWidth > 768) {
                this.classList.add('open');
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                const self = this;
                timeout = setTimeout(function() {
                    self.classList.remove('open');
                }, 200);
            }
        });

        // Mobile: click to toggle
        const parentSpan = dropdown.querySelector('span');
        if (parentSpan) {
            parentSpan.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                }
            });
        }
    });
});
