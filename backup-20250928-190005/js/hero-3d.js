// Hero Section Minimalist Space Background with Moving Dots
function initHero3D() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Star properties
    const stars = [];
    const starCount = 800;
    const layers = 3; // Create depth with multiple layers

    // Initialize stars
    for (let i = 0; i < starCount; i++) {
        const layer = Math.floor(Math.random() * layers);
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            speed: (layer + 1) * 0.05 + Math.random() * 0.05,
            opacity: 0.3 + (layer * 0.3) + Math.random() * 0.2,
            layer: layer,
            twinkleSpeed: Math.random() * 0.02 + 0.01,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }

    // Shooting stars
    const shootingStars = [];
    const maxShootingStars = 3;

    function createShootingStar() {
        if (shootingStars.length < maxShootingStars && Math.random() < 0.01) {
            shootingStars.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.5,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 8 + 4,
                opacity: 1,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5
            });
        }
    }

    // Mouse position for parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    canvas.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });

    // Animation variables
    let time = 0;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        time += 0.016; // ~60fps

        // Clear canvas with fade effect
        ctx.fillStyle = 'rgba(9, 10, 15, 0.1)';
        ctx.fillRect(0, 0, width, height);

        // Smooth mouse movement
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Draw stars
        stars.forEach(star => {
            // Parallax effect based on layer
            const parallaxX = (mouseX - width / 2) * star.layer * 0.01;
            const parallaxY = (mouseY - height / 2) * star.layer * 0.01;

            // Move stars slowly
            star.x -= star.speed;
            star.y += star.speed * 0.2;

            // Wrap around edges
            if (star.x < 0) star.x = width;
            if (star.y > height) star.y = 0;

            // Twinkling effect
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;

            // Draw star
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
            ctx.arc(
                star.x + parallaxX,
                star.y + parallaxY,
                star.size,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Add glow for brighter stars
            if (star.opacity > 0.7) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(200, 220, 255, ${star.opacity * twinkle * 0.3})`;
                ctx.arc(
                    star.x + parallaxX,
                    star.y + parallaxY,
                    star.size * 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });

        // Create new shooting stars occasionally
        createShootingStar();

        // Draw and update shooting stars
        shootingStars.forEach((shootingStar, index) => {
            shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
            shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
            shootingStar.opacity -= 0.02;

            if (shootingStar.opacity > 0) {
                // Draw shooting star trail
                const gradient = ctx.createLinearGradient(
                    shootingStar.x,
                    shootingStar.y,
                    shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length,
                    shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.moveTo(shootingStar.x, shootingStar.y);
                ctx.lineTo(
                    shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length,
                    shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
                );
                ctx.stroke();
            } else {
                // Remove faded shooting stars
                shootingStars.splice(index, 1);
            }
        });

        // Add subtle nebula clouds (very faint)
        const nebulaCenterX = width * 0.7;
        const nebulaCenterY = height * 0.3;
        const nebulaRadius = 200;

        const nebulaGradient = ctx.createRadialGradient(
            nebulaCenterX + Math.sin(time * 0.5) * 20,
            nebulaCenterY + Math.cos(time * 0.3) * 20,
            0,
            nebulaCenterX,
            nebulaCenterY,
            nebulaRadius
        );
        nebulaGradient.addColorStop(0, 'rgba(100, 50, 150, 0.05)');
        nebulaGradient.addColorStop(0.5, 'rgba(50, 100, 200, 0.03)');
        nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = nebulaGradient;
        ctx.fillRect(
            nebulaCenterX - nebulaRadius,
            nebulaCenterY - nebulaRadius,
            nebulaRadius * 2,
            nebulaRadius * 2
        );

        // Add second nebula
        const nebula2CenterX = width * 0.2;
        const nebula2CenterY = height * 0.7;
        const nebula2Gradient = ctx.createRadialGradient(
            nebula2CenterX + Math.cos(time * 0.4) * 15,
            nebula2CenterY + Math.sin(time * 0.6) * 15,
            0,
            nebula2CenterX,
            nebula2CenterY,
            150
        );
        nebula2Gradient.addColorStop(0, 'rgba(50, 150, 150, 0.04)');
        nebula2Gradient.addColorStop(0.5, 'rgba(100, 50, 150, 0.02)');
        nebula2Gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = nebula2Gradient;
        ctx.fillRect(
            nebula2CenterX - 150,
            nebula2CenterY - 150,
            300,
            300
        );
    }

    // Handle resize
    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Reinitialize stars for new dimensions
        stars.forEach(star => {
            if (star.x > width) star.x = Math.random() * width;
            if (star.y > height) star.y = Math.random() * height;
        });
    });

    // Start animation
    animate();
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero3D);
} else {
    initHero3D();
}