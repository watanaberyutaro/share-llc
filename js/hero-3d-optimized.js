// Optimized 3D Background with better performance
(function() {
    'use strict';

    // Performance settings
    const MOBILE_BREAKPOINT = 768;
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const pixelRatio = Math.min(window.devicePixelRatio, 2); // Cap at 2 for performance

    // Reduce complexity on mobile
    const gridSize = isMobile ? 8 : 12;
    const buildingChance = isMobile ? 0.3 : 0.4;
    const maxBuildingHeight = isMobile ? 80 : 150;

    // Initialize Three.js with performance optimizations
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf8f6f3, 500, 1500);

    const camera = new THREE.PerspectiveCamera(
        isMobile ? 60 : 50,
        window.innerWidth / window.innerHeight,
        1,
        2000
    );
    camera.position.set(200, 80, 300);
    camera.lookAt(0, 0, 0);

    // Renderer with optimizations
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: !isMobile, // Disable antialiasing on mobile
        alpha: true,
        powerPreference: "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(pixelRatio);
    renderer.shadowMap.enabled = false; // Disable shadows for performance
    renderer.setClearColor(0xf8f6f3);

    // Simplified city geometry
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    // Reduced grid for better performance
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
        for (let z = -gridSize / 2; z < gridSize / 2; z++) {
            if (Math.random() < buildingChance) {
                const height = 20 + Math.random() * maxBuildingHeight;
                const size = 15 + Math.random() * 25;

                // Simple box wireframe (fewer vertices)
                const positions = [
                    // Bottom square
                    x * 50 - size/2, 0, z * 50 - size/2,
                    x * 50 + size/2, 0, z * 50 - size/2,
                    x * 50 + size/2, 0, z * 50 + size/2,
                    x * 50 - size/2, 0, z * 50 + size/2,
                    // Top square
                    x * 50 - size/2, height, z * 50 - size/2,
                    x * 50 + size/2, height, z * 50 - size/2,
                    x * 50 + size/2, height, z * 50 + size/2,
                    x * 50 - size/2, height, z * 50 + size/2,
                ];

                // Add vertices for lines
                const indices = [
                    0,1, 1,2, 2,3, 3,0, // Bottom
                    4,5, 5,6, 6,7, 7,4, // Top
                    0,4, 1,5, 2,6, 3,7  // Vertical edges
                ];

                for (let i = 0; i < indices.length; i++) {
                    const idx = indices[i];
                    vertices.push(
                        positions[idx * 3],
                        positions[idx * 3 + 1],
                        positions[idx * 3 + 2]
                    );

                    // Pencil sketch color
                    const shade = 0.3 + Math.random() * 0.2;
                    colors.push(shade, shade, shade);
                }
            }
        }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Simple line material
    const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 1,
        opacity: 0.6,
        transparent: true
    });

    const cityLines = new THREE.LineSegments(geometry, material);
    scene.add(cityLines);

    // Ground plane with grid
    const gridHelper = new THREE.GridHelper(800, 20, 0x666666, 0x999999);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Simplified mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    // Debounced mouse move handler
    let mouseMoveTimer;
    function handleMouseMove(event) {
        clearTimeout(mouseMoveTimer);
        mouseMoveTimer = setTimeout(() => {
            targetMouseX = (event.clientX - window.innerWidth / 2) * 0.001;
            targetMouseY = (event.clientY - window.innerHeight / 2) * 0.001;
        }, 16); // ~60fps
    }

    // Only track mouse on desktop
    if (!isMobile) {
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Optimized animation loop
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    function animate(currentTime) {
        requestAnimationFrame(animate);

        // Frame rate limiting
        const deltaTime = currentTime - lastTime;
        if (deltaTime < frameInterval) return;
        lastTime = currentTime - (deltaTime % frameInterval);

        // Smooth mouse following
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Simplified camera movement
        const time = currentTime * 0.0001;
        camera.position.x = Math.sin(time) * 100 + mouseX * 5;
        camera.position.z = Math.cos(time) * 100 + 200;
        camera.position.y = 80 + mouseY * 5;
        camera.lookAt(0, 30, 0);

        // City floating effect (reduced)
        cityLines.position.y = Math.sin(currentTime * 0.0005) * 2;

        renderer.render(scene, camera);
    }

    animate(0);

    // Optimized resize handler with debouncing
    let resizeTimer;
    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 250);
    }

    window.addEventListener('resize', handleResize, { passive: true });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    });
})();