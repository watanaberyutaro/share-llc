// Business Section Image Slider
document.addEventListener('DOMContentLoaded', function() {
    const businessImages = document.querySelectorAll('.business-iamge figure');
    if (businessImages.length === 0) return;

    let currentIndex = 0;
    const totalImages = businessImages.length;
    const interval = 3000; // 3 seconds per image

    // Initialize - show first image
    businessImages.forEach((img, index) => {
        img.style.opacity = index === 0 ? '1' : '0';
        img.style.transition = 'opacity 1s ease';
    });

    // Auto-rotate images
    function rotateImages() {
        // Hide current image
        businessImages[currentIndex].style.opacity = '0';

        // Move to next image
        currentIndex = (currentIndex + 1) % totalImages;

        // Show next image
        businessImages[currentIndex].style.opacity = '1';
    }

    // Start rotation if there are multiple images
    if (totalImages > 1) {
        setInterval(rotateImages, interval);
    }

    // Optional: Pause on hover
    const container = document.querySelector('.business-iamge');
    if (container) {
        let intervalId = setInterval(rotateImages, interval);

        container.addEventListener('mouseenter', function() {
            clearInterval(intervalId);
        });

        container.addEventListener('mouseleave', function() {
            intervalId = setInterval(rotateImages, interval);
        });
    }
});