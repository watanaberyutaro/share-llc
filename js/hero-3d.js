// Hero Section Pencil-style Wireframe City
function initHero3D() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    document.head.appendChild(script);

    script.onload = function() {
        try {
            const canvas = document.getElementById('hero-canvas');
            if (!canvas) return;

            // Scene setup
            const scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0xf9f7f4, 100, 600);

            // Day/Night cycle state
            const dayNightCycle = {
                cycleTime: 10, // 10 seconds for full cycle (5s day, 5s night)
                currentTime: 0,
                isNight: false,
                dayColor: new THREE.Color(0xf9f7f4),      // Day - light beige
                nightColor: new THREE.Color(0x1a1a2e),    // Night - dark blue
                currentBgColor: new THREE.Color(0xf9f7f4)
            };

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0xf9f7f4, 1);

            // Create clouds
            const clouds = new THREE.Group();
            function createCloud(x, y, z) {
                const cloudGroup = new THREE.Group();

                // Multiple spheres to form a cloud
                const cloudParts = [
                    { size: 15, offsetX: 0, offsetY: 0, offsetZ: 0 },
                    { size: 12, offsetX: -10, offsetY: 2, offsetZ: 3 },
                    { size: 13, offsetX: 10, offsetY: 1, offsetZ: -2 },
                    { size: 10, offsetX: 15, offsetY: -2, offsetZ: 1 },
                    { size: 11, offsetX: -15, offsetY: -1, offsetZ: -1 }
                ];

                cloudParts.forEach(part => {
                    const sphereGeometry = new THREE.SphereGeometry(part.size, 16, 16);
                    const sphereMaterial = new THREE.MeshBasicMaterial({
                        color: 0xFFFFFF,
                        transparent: true,
                        opacity: 0.7
                    });
                    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                    sphere.position.set(part.offsetX, part.offsetY, part.offsetZ);
                    cloudGroup.add(sphere);
                });

                cloudGroup.position.set(x, y, z);
                return cloudGroup;
            }

            // Add multiple clouds
            const cloudPositions = [
                { x: -300, y: 150, z: -500 },
                { x: 200, y: 180, z: -600 },
                { x: -100, y: 160, z: -550 },
                { x: 400, y: 170, z: -650 },
                { x: -400, y: 155, z: -580 },
                { x: 100, y: 165, z: -700 },
                { x: -200, y: 175, z: -620 },
                { x: 350, y: 145, z: -560 }
            ];

            cloudPositions.forEach(pos => {
                const cloud = createCloud(pos.x, pos.y, pos.z);
                cloud.userData.speed = 0.05 + Math.random() * 0.05;
                cloud.userData.startX = pos.x;
                clouds.add(cloud);
            });
            scene.add(clouds);

            // Custom shader for pencil line effect
            const pencilLineMaterial = function(color = 0x333333, opacity = 0.6) {
                return new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 },
                        color: { value: new THREE.Color(color) },
                        opacity: { value: opacity }
                    },
                    vertexShader: `
                        uniform float time;
                        varying vec3 vPosition;
                        void main() {
                            vPosition = position;
                            vec3 pos = position;

                            // Add slight wobble for hand-drawn effect
                            pos.x += sin(position.y * 10.0 + time) * 0.2;
                            pos.z += cos(position.x * 10.0 + time) * 0.2;

                            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform vec3 color;
                        uniform float opacity;
                        uniform float time;
                        varying vec3 vPosition;

                        void main() {
                            // Pencil texture simulation
                            float noise = sin(vPosition.x * 100.0) * sin(vPosition.y * 100.0) * sin(vPosition.z * 100.0);
                            float alpha = opacity * (0.8 + noise * 0.2);

                            gl_FragColor = vec4(color, alpha);
                        }
                    `,
                    transparent: true,
                    wireframe: true
                });
            };

            // Building creation with wireframe
            function createSketchyBuilding(width, height, depth, x, z) {
                const geometry = new THREE.BoxGeometry(width, height, depth);

                // Create multiple wireframe layers for sketchy effect
                const group = new THREE.Group();

                // Main structure - using LineBasicMaterial for color control
                const edges1 = new THREE.EdgesGeometry(geometry);
                const line1Material = new THREE.LineBasicMaterial({
                    color: 0x2a2a2a,
                    transparent: true,
                    opacity: 0.8,
                    linewidth: 2
                });
                const line1 = new THREE.LineSegments(edges1, line1Material);
                line1.position.set(x, height/2, z);
                line1.userData.baseMaterial = line1Material;
                line1.userData.dayColor = new THREE.Color(0x2a2a2a);
                line1.userData.nightColor = new THREE.Color(0xcccccc);
                group.add(line1);

                // Second sketch line (offset) - lighter
                const edges2 = new THREE.EdgesGeometry(geometry);
                const line2 = new THREE.LineSegments(edges2, pencilLineMaterial(0x4a4a4a, 0.2));
                line2.position.set(x + 0.3, height/2 + 0.3, z + 0.3);
                group.add(line2);

                // Add window grid details
                if (height > 40) {
                    const windowsGeometry = new THREE.PlaneGeometry(width * 0.8, height * 0.9,
                        Math.floor(width/5), Math.floor(height/5));
                    const windowsEdges = new THREE.EdgesGeometry(windowsGeometry);
                    const windowLines = new THREE.LineSegments(windowsEdges, pencilLineMaterial(0x5a5a5a, 0.2));
                    windowLines.position.set(x, height/2, z + depth/2 + 0.1);
                    group.add(windowLines);
                }

                return group;
            }

            // Create city grid with varying building heights - reduced density
            const buildings = new THREE.Group();
            const gridSize = 12;
            const spacing = 40;

            for (let i = -gridSize/2; i < gridSize/2; i++) {
                for (let j = -gridSize/2; j < gridSize/2; j++) {
                    if (Math.random() > 0.6) {  // Only 40% chance of building (was 70%)
                        const width = 10 + Math.random() * 20;
                        const height = 30 + Math.random() * 120;
                        const depth = 10 + Math.random() * 20;
                        const x = i * spacing + (Math.random() - 0.5) * 15;
                        const z = j * spacing + (Math.random() - 0.5) * 15;

                        const building = createSketchyBuilding(width, height, depth, x, z);
                        buildings.add(building);
                    }
                }
            }
            scene.add(buildings);

            // Create ground grid with pencil lines
            const groundGeometry = new THREE.PlaneGeometry(600, 600, 30, 30);
            const groundEdges = new THREE.EdgesGeometry(groundGeometry);
            const groundGrid = new THREE.LineSegments(groundEdges, pencilLineMaterial(0x8a8a8a, 0.3));
            groundGrid.rotation.x = -Math.PI / 2;
            groundGrid.position.y = 0;
            scene.add(groundGrid);

            // Create roads
            const roads = new THREE.Group();

            // Horizontal roads
            function createHorizontalRoad(z, width = 500, roadWidth = 15) {
                const roadGroup = new THREE.Group();

                // Road surface (lighter gray)
                const roadGeometry = new THREE.PlaneGeometry(width, roadWidth);
                const road = new THREE.Mesh(roadGeometry, new THREE.MeshBasicMaterial({
                    color: 0x7a7a7a,
                    transparent: true,
                    opacity: 0.6
                }));
                road.rotation.x = -Math.PI / 2;
                road.position.set(0, 0.1, z);
                roadGroup.add(road);

                // Road edges (outline)
                const roadEdges = new THREE.EdgesGeometry(roadGeometry);
                const roadOutline = new THREE.LineSegments(roadEdges, pencilLineMaterial(0x2a2a2a, 0.8));
                roadOutline.rotation.x = -Math.PI / 2;
                roadOutline.position.set(0, 0.12, z);
                roadGroup.add(roadOutline);

                // Road center line (dashed yellow)
                const dashCount = 30;
                for (let i = 0; i < dashCount; i++) {
                    const dashGeometry = new THREE.PlaneGeometry(12, 0.8);
                    const dash = new THREE.Mesh(dashGeometry, new THREE.MeshBasicMaterial({
                        color: 0xFFD700,
                        transparent: true,
                        opacity: 0.7
                    }));
                    dash.rotation.x = -Math.PI / 2;
                    dash.position.set(-width/2 + (i * width/dashCount) + width/(dashCount*2), 0.15, z);
                    roadGroup.add(dash);
                }

                // Side lane lines
                const sideLineGeometry = new THREE.PlaneGeometry(width, 0.5);

                const sideLine1 = new THREE.Mesh(sideLineGeometry, new THREE.MeshBasicMaterial({
                    color: 0xEEEEEE,
                    transparent: true,
                    opacity: 0.6
                }));
                sideLine1.rotation.x = -Math.PI / 2;
                sideLine1.position.set(0, 0.15, z - roadWidth/2 + 0.5);
                roadGroup.add(sideLine1);

                const sideLine2 = new THREE.Mesh(sideLineGeometry, new THREE.MeshBasicMaterial({
                    color: 0xEEEEEE,
                    transparent: true,
                    opacity: 0.6
                }));
                sideLine2.rotation.x = -Math.PI / 2;
                sideLine2.position.set(0, 0.15, z + roadWidth/2 - 0.5);
                roadGroup.add(sideLine2);

                return roadGroup;
            }

            // Vertical roads
            function createVerticalRoad(x, length = 500, roadWidth = 15) {
                const roadGroup = new THREE.Group();

                // Road surface (lighter gray)
                const roadGeometry = new THREE.PlaneGeometry(roadWidth, length);
                const road = new THREE.Mesh(roadGeometry, new THREE.MeshBasicMaterial({
                    color: 0x7a7a7a,
                    transparent: true,
                    opacity: 0.6
                }));
                road.rotation.x = -Math.PI / 2;
                road.position.set(x, 0.1, 0);
                roadGroup.add(road);

                // Road edges (outline)
                const roadEdges = new THREE.EdgesGeometry(roadGeometry);
                const roadOutline = new THREE.LineSegments(roadEdges, pencilLineMaterial(0x2a2a2a, 0.8));
                roadOutline.rotation.x = -Math.PI / 2;
                roadOutline.position.set(x, 0.12, 0);
                roadGroup.add(roadOutline);

                // Road center line (dashed yellow)
                const dashCount = 30;
                for (let i = 0; i < dashCount; i++) {
                    const dashGeometry = new THREE.PlaneGeometry(0.8, 12);
                    const dash = new THREE.Mesh(dashGeometry, new THREE.MeshBasicMaterial({
                        color: 0xFFD700,
                        transparent: true,
                        opacity: 0.7
                    }));
                    dash.rotation.x = -Math.PI / 2;
                    dash.position.set(x, 0.15, -length/2 + (i * length/dashCount) + length/(dashCount*2));
                    roadGroup.add(dash);
                }

                // Side lane lines
                const sideLineGeometry = new THREE.PlaneGeometry(0.5, length);

                const sideLine1 = new THREE.Mesh(sideLineGeometry, new THREE.MeshBasicMaterial({
                    color: 0xEEEEEE,
                    transparent: true,
                    opacity: 0.6
                }));
                sideLine1.rotation.x = -Math.PI / 2;
                sideLine1.position.set(x - roadWidth/2 + 0.5, 0.15, 0);
                roadGroup.add(sideLine1);

                const sideLine2 = new THREE.Mesh(sideLineGeometry, new THREE.MeshBasicMaterial({
                    color: 0xEEEEEE,
                    transparent: true,
                    opacity: 0.6
                }));
                sideLine2.rotation.x = -Math.PI / 2;
                sideLine2.position.set(x + roadWidth/2 - 0.5, 0.15, 0);
                roadGroup.add(sideLine2);

                return roadGroup;
            }

            // Add roads
            roads.add(createHorizontalRoad(-40));
            roads.add(createHorizontalRoad(40));
            roads.add(createHorizontalRoad(-80));
            roads.add(createHorizontalRoad(100));
            roads.add(createVerticalRoad(-60));
            roads.add(createVerticalRoad(60));
            roads.add(createVerticalRoad(-100));
            roads.add(createVerticalRoad(100));
            scene.add(roads);

            // Create traffic lights
            function createTrafficLight(x, z, rotation = 0) {
                const lightGroup = new THREE.Group();

                // Pole
                const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8, 8);
                const poleEdges = new THREE.EdgesGeometry(poleGeometry);
                const pole = new THREE.LineSegments(poleEdges, pencilLineMaterial(0x4a4a4a, 0.7));
                pole.position.y = 4;
                lightGroup.add(pole);

                // Light box
                const boxGeometry = new THREE.BoxGeometry(2, 5, 1);
                const boxEdges = new THREE.EdgesGeometry(boxGeometry);
                const box = new THREE.LineSegments(boxEdges, pencilLineMaterial(0x3a3a3a, 0.8));
                box.position.y = 9;
                lightGroup.add(box);

                // Red light
                const redLightGeometry = new THREE.CircleGeometry(0.6, 8);
                const redLight = new THREE.Mesh(redLightGeometry, new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0.3
                }));
                redLight.position.set(0, 10.5, 0.6);
                lightGroup.add(redLight);

                // Yellow light
                const yellowLightGeometry = new THREE.CircleGeometry(0.6, 8);
                const yellowLight = new THREE.Mesh(yellowLightGeometry, new THREE.MeshBasicMaterial({
                    color: 0xffff00,
                    transparent: true,
                    opacity: 0.3
                }));
                yellowLight.position.set(0, 9, 0.6);
                lightGroup.add(yellowLight);

                // Green light
                const greenLightGeometry = new THREE.CircleGeometry(0.6, 8);
                const greenLight = new THREE.Mesh(greenLightGeometry, new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    transparent: true,
                    opacity: 0.3
                }));
                greenLight.position.set(0, 7.5, 0.6);
                lightGroup.add(greenLight);

                lightGroup.position.set(x, 0, z);
                lightGroup.rotation.y = rotation;

                // Store light references for animation
                lightGroup.userData = {
                    redLight: redLight,
                    yellowLight: yellowLight,
                    greenLight: greenLight,
                    state: 'green',
                    timer: 0
                };

                return lightGroup;
            }

            // Add traffic lights at intersections
            const trafficLights = new THREE.Group();
            const lightPositions = [
                { x: -65, z: -45, rotation: 0 },
                { x: -55, z: -45, rotation: Math.PI },
                { x: -65, z: 35, rotation: 0 },
                { x: -55, z: 35, rotation: Math.PI },
                { x: 55, z: -45, rotation: 0 },
                { x: 65, z: -45, rotation: Math.PI },
                { x: 55, z: 35, rotation: 0 },
                { x: 65, z: 35, rotation: Math.PI },
                { x: -65, z: -85, rotation: 0 },
                { x: -55, z: -85, rotation: Math.PI },
                { x: 55, z: 95, rotation: 0 },
                { x: 65, z: 95, rotation: Math.PI }
            ];

            lightPositions.forEach(pos => {
                const light = createTrafficLight(pos.x, pos.z, pos.rotation);
                trafficLights.add(light);
            });
            scene.add(trafficLights);

            // Create shops with glowing signs
            function createShop(x, z, shopType) {
                const shopGroup = new THREE.Group();

                // Shop building
                const buildingWidth = 15;
                const buildingHeight = 20;
                const buildingDepth = 12;

                const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
                const buildingEdges = new THREE.EdgesGeometry(buildingGeometry);
                const building = new THREE.LineSegments(buildingEdges, pencilLineMaterial(0x3a3a3a, 0.7));
                building.position.y = buildingHeight / 2;
                shopGroup.add(building);

                // Shop details (windows)
                const windowGeometry = new THREE.PlaneGeometry(buildingWidth * 0.8, buildingHeight * 0.4, 3, 2);
                const windowEdges = new THREE.EdgesGeometry(windowGeometry);
                const windows = new THREE.LineSegments(windowEdges, pencilLineMaterial(0x5a5a5a, 0.4));
                windows.position.set(0, buildingHeight * 0.3, buildingDepth / 2 + 0.1);
                shopGroup.add(windows);

                // Window lights (glowing windows at night)
                const windowLights = [];
                for (let i = 0; i < 6; i++) {
                    const windowLight = new THREE.Mesh(
                        new THREE.PlaneGeometry(2.5, 2.5),
                        new THREE.MeshBasicMaterial({
                            color: 0xFFE4B5,
                            transparent: true,
                            opacity: 0.0 // Start at 0, will fade in at night
                        })
                    );
                    const row = Math.floor(i / 3);
                    const col = i % 3;
                    windowLight.position.set(
                        -3 + col * 3,
                        buildingHeight * 0.2 + row * 3.5,
                        buildingDepth / 2 + 0.15
                    );
                    windowLights.push(windowLight);
                    shopGroup.add(windowLight);
                }

                // Glowing shop sign
                const signWidth = buildingWidth * 0.7;
                const signHeight = 3;
                const signGeometry = new THREE.PlaneGeometry(signWidth, signHeight);

                // Sign color based on shop type
                const signColors = {
                    cafe: 0xFF9A4D,      // Orange
                    restaurant: 0xFF4D6D, // Red
                    shop: 0x4DAFFF,       // Blue
                    bar: 0xB84DFF,        // Purple
                    store: 0x4DFF7C       // Green
                };

                const signColor = signColors[shopType] || 0xFFD700;

                const sign = new THREE.Mesh(signGeometry, new THREE.MeshBasicMaterial({
                    color: signColor,
                    transparent: true,
                    opacity: 0.0, // Start at 0, will fade in at night
                    side: THREE.DoubleSide
                }));
                sign.position.set(0, buildingHeight + 2, buildingDepth / 2 + 0.2);
                shopGroup.add(sign);

                // Sign border (black outline)
                const signEdges = new THREE.EdgesGeometry(signGeometry);
                const signBorder = new THREE.LineSegments(signEdges, new THREE.LineBasicMaterial({
                    color: 0x000000,
                    linewidth: 2,
                    transparent: false
                }));
                signBorder.position.set(0, buildingHeight + 2, buildingDepth / 2 + 0.3);
                shopGroup.add(signBorder);

                // Glow effect (multiple layers) - starts off during day
                const glowLayers = [];
                for (let i = 0; i < 3; i++) {
                    const glowGeometry = new THREE.PlaneGeometry(signWidth + i * 2, signHeight + i * 1);
                    const glow = new THREE.Mesh(glowGeometry, new THREE.MeshBasicMaterial({
                        color: signColor,
                        transparent: true,
                        opacity: 0.0, // Start at 0, will fade in at night
                        side: THREE.DoubleSide
                    }));
                    glow.position.set(0, buildingHeight + 2, buildingDepth / 2 + 0.15 - (i * 0.1));
                    glow.userData.baseOpacity = 0.1 - (i * 0.03);
                    glowLayers.push(glow);
                    shopGroup.add(glow);
                }

                // Awning
                const awningGeometry = new THREE.PlaneGeometry(buildingWidth * 0.9, 4);
                const awningEdges = new THREE.EdgesGeometry(awningGeometry);
                const awning = new THREE.LineSegments(awningEdges, pencilLineMaterial(0x6a6a6a, 0.6));
                awning.rotation.x = -Math.PI / 4;
                awning.position.set(0, buildingHeight * 0.6, buildingDepth / 2 + 2);
                shopGroup.add(awning);

                shopGroup.position.set(x, 0, z);

                // Store sign reference for animation
                shopGroup.userData = {
                    sign: sign,
                    signBorder: signBorder,
                    glowLayers: glowLayers,
                    windowLights: windowLights,
                    baseOpacity: 0.8,
                    pulseSpeed: 0.5 + Math.random() * 0.5
                };

                return shopGroup;
            }

            // Add shops around the city
            const shops = new THREE.Group();
            const shopData = [
                { x: -130, z: -60, type: 'cafe' },
                { x: -90, z: 20, type: 'restaurant' },
                { x: -140, z: 80, type: 'shop' },
                { x: 120, z: -70, type: 'bar' },
                { x: 90, z: 10, type: 'store' },
                { x: 130, z: 100, type: 'cafe' },
                { x: -30, z: -140, type: 'restaurant' },
                { x: 40, z: -130, type: 'shop' },
                { x: -20, z: 140, type: 'bar' },
                { x: 60, z: 135, type: 'store' },
                { x: -170, z: -20, type: 'cafe' },
                { x: 170, z: 30, type: 'restaurant' }
            ];

            shopData.forEach(data => {
                const shop = createShop(data.x, data.z, data.type);
                shops.add(shop);
            });
            scene.add(shops);

            // Create street lights
            function createStreetLight(x, z) {
                const lightGroup = new THREE.Group();

                // Pole
                const poleGeometry = new THREE.CylinderGeometry(0.4, 0.5, 12, 8);
                const poleEdges = new THREE.EdgesGeometry(poleGeometry);
                const pole = new THREE.LineSegments(poleEdges, pencilLineMaterial(0x4a4a4a, 0.8));
                pole.position.y = 6;
                lightGroup.add(pole);

                // Light fixture top
                const fixtureGeometry = new THREE.CylinderGeometry(0.5, 1.2, 2, 8);
                const fixtureEdges = new THREE.EdgesGeometry(fixtureGeometry);
                const fixture = new THREE.LineSegments(fixtureEdges, pencilLineMaterial(0x3a3a3a, 0.8));
                fixture.position.y = 13;
                lightGroup.add(fixture);

                // Light bulb (glowing sphere) - starts off during day
                const bulbGeometry = new THREE.SphereGeometry(0.8, 8, 8);
                const bulb = new THREE.Mesh(bulbGeometry, new THREE.MeshBasicMaterial({
                    color: 0xFFF8DC,
                    transparent: true,
                    opacity: 0.0 // Start at 0, will fade in at night
                }));
                bulb.position.y = 12.5;
                lightGroup.add(bulb);

                // Glow effect around bulb - starts off during day
                const glowLayers = [];
                for (let i = 0; i < 3; i++) {
                    const glowGeometry = new THREE.SphereGeometry(0.8 + i * 0.5, 8, 8);
                    const glow = new THREE.Mesh(glowGeometry, new THREE.MeshBasicMaterial({
                        color: 0xFFFFAA,
                        transparent: true,
                        opacity: 0.0, // Start at 0, will fade in at night
                        side: THREE.DoubleSide
                    }));
                    glow.position.y = 12.5;
                    glow.userData.baseOpacity = 0.15 - (i * 0.04);
                    glowLayers.push(glow);
                    lightGroup.add(glow);
                }

                // Light cone (illumination area indicator)
                const coneGeometry = new THREE.ConeGeometry(3, 6, 8, 1, true);
                const cone = new THREE.Mesh(coneGeometry, new THREE.MeshBasicMaterial({
                    color: 0xFFFFCC,
                    transparent: true,
                    opacity: 0.05,
                    side: THREE.DoubleSide
                }));
                cone.position.y = 9;
                cone.rotation.x = Math.PI;
                lightGroup.add(cone);

                lightGroup.position.set(x, 0, z);

                // Store references for animation
                lightGroup.userData = {
                    bulb: bulb,
                    glowLayers: glowLayers,
                    flickerSpeed: 0.5 + Math.random() * 0.3,
                    baseOpacity: 0.7
                };

                return lightGroup;
            }

            // Add street lights along roads
            const streetLights = new THREE.Group();
            const streetLightPositions = [
                // Along horizontal roads
                { x: -150, z: -50 }, { x: -100, z: -50 }, { x: -50, z: -50 }, { x: 0, z: -50 },
                { x: 50, z: -50 }, { x: 100, z: -50 }, { x: 150, z: -50 },
                { x: -150, z: 30 }, { x: -100, z: 30 }, { x: -50, z: 30 }, { x: 0, z: 30 },
                { x: 50, z: 30 }, { x: 100, z: 30 }, { x: 150, z: 30 },
                { x: -150, z: -90 }, { x: -50, z: -90 }, { x: 50, z: -90 }, { x: 150, z: -90 },
                { x: -150, z: 90 }, { x: -50, z: 90 }, { x: 50, z: 90 }, { x: 150, z: 90 },
                // Along vertical roads
                { x: -70, z: -120 }, { x: -70, z: -80 }, { x: -70, z: -20 }, { x: -70, z: 20 },
                { x: -70, z: 60 }, { x: -70, z: 100 }, { x: -70, z: 140 },
                { x: 50, z: -120 }, { x: 50, z: -80 }, { x: 50, z: -20 }, { x: 50, z: 20 },
                { x: 50, z: 60 }, { x: 50, z: 100 }, { x: 50, z: 140 },
                { x: -110, z: -100 }, { x: -110, z: 0 }, { x: -110, z: 100 },
                { x: 90, z: -100 }, { x: 90, z: 0 }, { x: 90, z: 100 }
            ];

            streetLightPositions.forEach(pos => {
                const light = createStreetLight(pos.x, pos.z);
                streetLights.add(light);
            });
            scene.add(streetLights);

            // Create trees with dark wood trunks and green leaves
            function createTree(x, z) {
                const treeGroup = new THREE.Group();

                // Trunk (dark wood color)
                const trunkGeometry = new THREE.CylinderGeometry(1.5, 2, 12, 8);
                const trunkEdges = new THREE.EdgesGeometry(trunkGeometry);
                const trunk = new THREE.LineSegments(trunkEdges, pencilLineMaterial(0x3d2817, 0.8));
                trunk.position.y = 6;
                treeGroup.add(trunk);

                // Leaves (green, sketchy spheres at different heights)
                const leafPositions = [
                    { y: 12, size: 8 },
                    { y: 15, size: 6 },
                    { y: 17, size: 4 }
                ];

                leafPositions.forEach(leaf => {
                    const leafGeometry = new THREE.SphereGeometry(leaf.size, 6, 6);
                    const leafEdges = new THREE.EdgesGeometry(leafGeometry);
                    const leafMesh = new THREE.LineSegments(leafEdges, pencilLineMaterial(0x2d5016, 0.6));
                    leafMesh.position.y = leaf.y;
                    treeGroup.add(leafMesh);

                    // Add secondary offset leaf layer for sketchy effect
                    const leafMesh2 = new THREE.LineSegments(
                        new THREE.EdgesGeometry(new THREE.SphereGeometry(leaf.size, 6, 6)),
                        pencilLineMaterial(0x3a6b1f, 0.4)
                    );
                    leafMesh2.position.set(0.3, leaf.y + 0.3, 0.3);
                    treeGroup.add(leafMesh2);
                });

                treeGroup.position.set(x, 0, z);
                return treeGroup;
            }

            // Add trees around the outer edges of the city (more trees)
            const trees = new THREE.Group();
            const treePositions = [
                // North edge
                { x: -200, z: -220 }, { x: -100, z: -230 }, { x: 50, z: -225 }, { x: 180, z: -220 },
                { x: -150, z: -225 }, { x: -50, z: -235 }, { x: 0, z: -228 }, { x: 120, z: -232 },
                // South edge
                { x: -180, z: 230 }, { x: -50, z: 225 }, { x: 100, z: 235 }, { x: 200, z: 230 },
                { x: -120, z: 235 }, { x: 0, z: 228 }, { x: 150, z: 232 }, { x: -220, z: 225 },
                // East edge
                { x: 220, z: -150 }, { x: 230, z: -50 }, { x: 225, z: 60 }, { x: 220, z: 170 },
                { x: 228, z: -100 }, { x: 235, z: 0 }, { x: 232, z: 120 }, { x: 225, z: -200 },
                // West edge
                { x: -230, z: -170 }, { x: -220, z: -60 }, { x: -235, z: 50 }, { x: -225, z: 160 },
                { x: -228, z: -120 }, { x: -232, z: 0 }, { x: -225, z: 100 }, { x: -238, z: -30 },
                // Scattered near buildings (more)
                { x: -80, z: -100 }, { x: 90, z: -80 }, { x: -70, z: 110 }, { x: 120, z: 95 },
                { x: -110, z: -50 }, { x: 110, z: -60 }, { x: -100, z: 70 }, { x: 85, z: 80 },
                { x: -130, z: -30 }, { x: 140, z: -20 }, { x: -50, z: 130 }, { x: 60, z: 120 },
                { x: -160, z: 10 }, { x: 165, z: 5 }, { x: -40, z: -130 }, { x: 45, z: -125 }
            ];

            treePositions.forEach(pos => {
                const tree = createTree(pos.x, pos.z);
                trees.add(tree);
            });
            scene.add(trees);

            // Random colorful colors for cars and people
            const colorfulColors = [
                0xFF6B6B, // Red
                0x4ECDC4, // Turquoise
                0x45B7D1, // Blue
                0xFFA07A, // Light Salmon
                0x98D8C8, // Mint
                0xF7DC6F, // Yellow
                0xBB8FCE, // Purple
                0x85C1E2, // Sky Blue
                0xF8B739, // Orange
                0xEB984E, // Dark Orange
                0x5DADE2, // Light Blue
                0xEC7063, // Coral
                0x48C9B0, // Teal
                0xAF7AC5, // Lavender
                0x52BE80  // Green
            ];

            function getRandomColor() {
                return colorfulColors[Math.floor(Math.random() * colorfulColors.length)];
            }

            // Create cars (simple box vehicles)
            function createCar(color) {
                const carGroup = new THREE.Group();

                // Car body
                const bodyGeometry = new THREE.BoxGeometry(8, 3, 4);
                const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
                const body = new THREE.LineSegments(bodyEdges, pencilLineMaterial(color, 0.8));
                body.position.y = 2;
                carGroup.add(body);

                // Car roof
                const roofGeometry = new THREE.BoxGeometry(5, 2, 3.5);
                const roofEdges = new THREE.EdgesGeometry(roofGeometry);
                const roof = new THREE.LineSegments(roofEdges, pencilLineMaterial(color, 0.8));
                roof.position.y = 4;
                carGroup.add(roof);

                // Wheels (simple circles)
                const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 8);
                const wheelEdges = new THREE.EdgesGeometry(wheelGeometry);

                const wheel1 = new THREE.LineSegments(wheelEdges, pencilLineMaterial(0x2a2a2a, 0.8));
                wheel1.rotation.z = Math.PI / 2;
                wheel1.position.set(-2.5, 1, 2.5);
                carGroup.add(wheel1);

                const wheel2 = new THREE.LineSegments(wheelEdges, pencilLineMaterial(0x2a2a2a, 0.8));
                wheel2.rotation.z = Math.PI / 2;
                wheel2.position.set(2.5, 1, 2.5);
                carGroup.add(wheel2);

                const wheel3 = new THREE.LineSegments(wheelEdges, pencilLineMaterial(0x2a2a2a, 0.8));
                wheel3.rotation.z = Math.PI / 2;
                wheel3.position.set(-2.5, 1, -2.5);
                carGroup.add(wheel3);

                const wheel4 = new THREE.LineSegments(wheelEdges, pencilLineMaterial(0x2a2a2a, 0.8));
                wheel4.rotation.z = Math.PI / 2;
                wheel4.position.set(2.5, 1, -2.5);
                carGroup.add(wheel4);

                return carGroup;
            }

            // Add cars with movement paths
            const cars = new THREE.Group();
            const carData = [
                { path: 'horizontal', z: -40, speed: 0.5, startX: -250 },
                { path: 'horizontal', z: 40, speed: 0.4, startX: 250, direction: -1 },
                { path: 'vertical', x: -60, speed: 0.45, startZ: -250 },
                { path: 'vertical', x: 60, speed: 0.5, startZ: 250, direction: -1 },
                { path: 'horizontal', z: -80, speed: 0.35, startX: -250 },
                { path: 'horizontal', z: 100, speed: 0.45, startX: 250, direction: -1 },
                { path: 'vertical', x: -100, speed: 0.4, startZ: -250 },
                { path: 'vertical', x: 100, speed: 0.38, startZ: 250, direction: -1 }
            ];

            carData.forEach(data => {
                const car = createCar(getRandomColor());
                car.userData = {
                    path: data.path,
                    speed: data.speed,
                    direction: data.direction || 1
                };

                if (data.path === 'horizontal') {
                    car.position.set(data.startX, 0, data.z);
                    if (data.direction === -1) car.rotation.y = Math.PI;
                } else {
                    car.position.set(data.x, 0, data.startZ);
                    car.rotation.y = data.direction === -1 ? -Math.PI / 2 : Math.PI / 2;
                }

                cars.add(car);
            });
            scene.add(cars);

            // Create people (simple stick figures with colorful clothes)
            function createPerson(clothingColor) {
                const personGroup = new THREE.Group();

                // Head
                const headGeometry = new THREE.SphereGeometry(0.8, 6, 6);
                const headEdges = new THREE.EdgesGeometry(headGeometry);
                const head = new THREE.LineSegments(headEdges, pencilLineMaterial(0x3a3a3a, 0.7));
                head.position.y = 5;
                personGroup.add(head);

                // Body (colorful clothing)
                const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2.5, 6);
                const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
                const body = new THREE.LineSegments(bodyEdges, pencilLineMaterial(clothingColor, 0.8));
                body.position.y = 3;
                personGroup.add(body);

                // Legs
                const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 6);
                const legEdges = new THREE.EdgesGeometry(legGeometry);

                const leg1 = new THREE.LineSegments(legEdges, pencilLineMaterial(0x3a3a3a, 0.7));
                leg1.position.set(-0.3, 1, 0);
                personGroup.add(leg1);

                const leg2 = new THREE.LineSegments(legEdges, pencilLineMaterial(0x3a3a3a, 0.7));
                leg2.position.set(0.3, 1, 0);
                personGroup.add(leg2);

                return personGroup;
            }

            // Add people walking around (more people)
            const people = new THREE.Group();
            const peopleData = [
                { x: -100, z: -50, targetX: -100, targetZ: 80, speed: 0.15 },
                { x: 50, z: 70, targetX: 120, targetZ: 70, speed: 0.12 },
                { x: -70, z: -90, targetX: 30, targetZ: -90, speed: 0.13 },
                { x: 130, z: -30, targetX: 130, targetZ: 60, speed: 0.14 },
                { x: -120, z: 100, targetX: -40, targetZ: 100, speed: 0.11 },
                { x: 80, z: -60, targetX: 80, targetZ: 40, speed: 0.13 },
                { x: -150, z: -20, targetX: -50, targetZ: -20, speed: 0.14 },
                { x: 150, z: 90, targetX: 60, targetZ: 90, speed: 0.12 },
                { x: -30, z: -120, targetX: -30, targetZ: 50, speed: 0.15 },
                { x: 100, z: -100, targetX: 100, targetZ: 30, speed: 0.13 },
                { x: -90, z: 60, targetX: 40, targetZ: 60, speed: 0.11 },
                { x: 20, z: -70, targetX: 90, targetZ: -70, speed: 0.14 },
                { x: -140, z: 40, targetX: -140, targetZ: 130, speed: 0.12 },
                { x: 110, z: 20, targetX: 110, targetZ: 110, speed: 0.13 },
                { x: -60, z: -40, targetX: 50, targetZ: -40, speed: 0.15 },
                { x: 140, z: -60, targetX: 50, targetZ: -60, speed: 0.12 }
            ];

            peopleData.forEach((data, index) => {
                const person = createPerson(getRandomColor());
                person.position.set(data.x, 0, data.z);
                person.userData = {
                    startX: data.x,
                    startZ: data.z,
                    targetX: data.targetX,
                    targetZ: data.targetZ,
                    speed: data.speed,
                    progress: 0
                };

                // Face walking direction
                const dx = data.targetX - data.x;
                const dz = data.targetZ - data.z;
                person.rotation.y = Math.atan2(dx, dz);

                people.add(person);
            });
            scene.add(people);

            // Add construction lines effect
            const constructionLines = new THREE.Group();
            for (let i = 0; i < 20; i++) {
                const lineGeometry = new THREE.BufferGeometry();
                const lineVertices = new Float32Array([
                    (Math.random() - 0.5) * 400, 0, (Math.random() - 0.5) * 400,
                    (Math.random() - 0.5) * 400, Math.random() * 150, (Math.random() - 0.5) * 400
                ]);
                lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));

                const line = new THREE.Line(lineGeometry, pencilLineMaterial(0xaaaaaa, 0.1));
                line.userData = {
                    originalVertices: lineVertices.slice(),
                    speed: Math.random() * 0.5 + 0.5
                };
                constructionLines.add(line);
            }
            scene.add(constructionLines);

            // Add floating data particles (paper dots)
            const particlesGeometry = new THREE.BufferGeometry();
            const particlesCount = 500;
            const particlesPositions = new Float32Array(particlesCount * 3);

            for (let i = 0; i < particlesCount * 3; i += 3) {
                particlesPositions[i] = (Math.random() - 0.5) * 400;
                particlesPositions[i + 1] = Math.random() * 200;
                particlesPositions[i + 2] = (Math.random() - 0.5) * 400;
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                color: 0x4a4a4a,
                size: 1,
                transparent: true,
                opacity: 0.4,
                sizeAttenuation: true
            });

            const particles = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particles);

            // Create scanning line effect (like pencil ruler)
            const scanLineGeometry = new THREE.PlaneGeometry(600, 1);
            const scanLineMaterial = new THREE.MeshBasicMaterial({
                color: 0x3a3a3a,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide
            });
            const scanLine = new THREE.Mesh(scanLineGeometry, scanLineMaterial);
            scanLine.rotation.x = Math.PI / 2;
            scene.add(scanLine);

            // Add sketch marks (random lines)
            const sketchMarks = new THREE.Group();
            for (let i = 0; i < 30; i++) {
                const markGeometry = new THREE.BufferGeometry();
                const markVertices = new Float32Array([
                    (Math.random() - 0.5) * 500, Math.random() * 100, (Math.random() - 0.5) * 500,
                    (Math.random() - 0.5) * 500 + Math.random() * 20,
                    Math.random() * 100 + Math.random() * 20,
                    (Math.random() - 0.5) * 500 + Math.random() * 20
                ]);
                markGeometry.setAttribute('position', new THREE.BufferAttribute(markVertices, 3));

                const mark = new THREE.Line(markGeometry, pencilLineMaterial(0x7a7a7a, 0.15));
                mark.userData = {
                    fadeSpeed: Math.random() * 0.02
                };
                sketchMarks.add(mark);
            }
            scene.add(sketchMarks);

            // Position camera (closer view)
            camera.position.set(0, 60, 120);
            camera.lookAt(0, 30, 0);

            // Mouse tracking
            let mouseX = 0;
            let mouseY = 0;
            document.addEventListener('mousemove', (e) => {
                mouseX = (e.clientX / window.innerWidth) * 2 - 1;
                mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            });

            // Animation
            let time = 0;

            function animate() {
                requestAnimationFrame(animate);
                time += 0.01;

                // Update day/night cycle
                dayNightCycle.currentTime = (time * 0.5) % dayNightCycle.cycleTime;
                const cycleProgress = dayNightCycle.currentTime / dayNightCycle.cycleTime;

                // Smooth transition using sine wave for natural day/night cycle
                const dayNightValue = Math.sin(cycleProgress * Math.PI * 2) * 0.5 + 0.5;
                // 0 = night, 1 = day

                // Update background color
                dayNightCycle.currentBgColor.lerpColors(
                    dayNightCycle.nightColor,
                    dayNightCycle.dayColor,
                    dayNightValue
                );
                renderer.setClearColor(dayNightCycle.currentBgColor);
                scene.fog.color.copy(dayNightCycle.currentBgColor);

                // Night intensity for lights (0 = day/off, 1 = night/on)
                const nightIntensity = 1 - dayNightValue;

                // Animate clouds (slow drift and fade at night)
                clouds.children.forEach((cloud, index) => {
                    // Drift clouds slowly
                    cloud.position.x += cloud.userData.speed;

                    // Reset position when out of view
                    if (cloud.position.x > 500) {
                        cloud.position.x = cloud.userData.startX - 1000;
                    }

                    // Fade clouds at night
                    cloud.children.forEach(sphere => {
                        sphere.material.opacity = 0.7 * dayNightValue;
                    });
                });

                // Calculate text brightness for both hero text and navigation
                // Smoothly interpolate between night (255) and day (51) based on dayNightValue
                // dayNightValue: 0 = night, 1 = day
                const nightBrightness = 255; // White text at night
                const dayBrightness = 51;    // Dark text (#333) during day
                const textBrightness = Math.round(nightBrightness + (dayBrightness - nightBrightness) * dayNightValue);

                // Update hero text color
                const heroTextElement = document.querySelector('.mv-text-center h2');
                if (heroTextElement) {
                    const colorValue = `rgb(${textBrightness}, ${textBrightness}, ${textBrightness})`;
                    heroTextElement.style.color = colorValue;
                    heroTextElement.style.textShadow = 'none';
                }

                // Update navigation color
                const navElement = document.querySelector('.hero-nav-bottom-right');
                if (navElement) {
                    const colorValue = `rgb(${textBrightness}, ${textBrightness}, ${textBrightness})`;
                    navElement.style.setProperty('color', colorValue, 'important');

                    // Update all links and headings in navigation
                    const navLinks = navElement.querySelectorAll('a, h3');
                    navLinks.forEach(link => {
                        link.style.setProperty('color', colorValue, 'important');
                        link.style.setProperty('text-shadow', 'none', 'important');
                    });

                    // Update border colors for h3 elements
                    const navH3s = navElement.querySelectorAll('h3');
                    navH3s.forEach(h3 => {
                        h3.style.setProperty('border-bottom-color', colorValue, 'important');
                    });
                }

                // Camera movement - reduced mouse influence (closer view)
                camera.position.x = Math.sin(time * 0.3) * 60 + mouseX * 3;
                camera.position.z = Math.cos(time * 0.3) * 60 + 120;
                camera.position.y = 60 + mouseY * 3;
                camera.lookAt(0, 30, 0);

                // Animate buildings (subtle pulse and color change)
                buildings.children.forEach((building, index) => {
                    const pulse = Math.sin(time * 2 + index * 0.1) * 0.002;
                    building.scale.y = 1 + pulse;

                    // Change building outline color based on day/night
                    if (building.children[0] && building.children[0].userData.baseMaterial) {
                        const mainLine = building.children[0];
                        const material = mainLine.userData.baseMaterial;

                        // Interpolate between day and night colors for edges
                        const currentColor = new THREE.Color();
                        currentColor.lerpColors(
                            mainLine.userData.dayColor,
                            mainLine.userData.nightColor,
                            nightIntensity
                        );
                        material.color.copy(currentColor);

                        // Increase opacity at night for better visibility
                        material.opacity = 0.8 + (nightIntensity * 0.2);
                    }
                });

                // Add window lights to regular buildings at night
                if (nightIntensity > 0.3) {
                    buildings.children.forEach((building, index) => {
                        // Add window lights if not already added
                        if (!building.userData.windowLightsAdded) {
                            building.userData.windowLightsAdded = true;
                            building.userData.windowLights = [];

                            // Get building height from first child (wireframe edges)
                            if (building.children[0]) {
                                const buildingLine = building.children[0];
                                const buildingY = buildingLine.position.y;
                                const buildingHeight = buildingY * 2;

                                // Add random window lights
                                const windowCount = Math.floor(Math.random() * 8) + 4;
                                for (let i = 0; i < windowCount; i++) {
                                    const windowLight = new THREE.Mesh(
                                        new THREE.PlaneGeometry(1.5, 1.5),
                                        new THREE.MeshBasicMaterial({
                                            color: 0xFFE4B5,
                                            transparent: true,
                                            opacity: 0.0
                                        })
                                    );
                                    windowLight.position.set(
                                        buildingLine.position.x + (Math.random() - 0.5) * 8,
                                        Math.random() * buildingHeight * 0.8 + buildingHeight * 0.1,
                                        buildingLine.position.z + 6
                                    );
                                    windowLight.userData.flickerOffset = Math.random() * 10;
                                    building.add(windowLight);
                                    building.userData.windowLights.push(windowLight);
                                }
                            }
                        }

                        // Animate window lights
                        if (building.userData.windowLights) {
                            building.userData.windowLights.forEach((light) => {
                                const flicker = Math.sin(time * 2 + light.userData.flickerOffset) * 0.2 + 0.8;
                                light.material.opacity = 0.6 * flicker * nightIntensity;
                            });
                        }
                    });
                }

                // Animate trees (gentle sway)
                trees.children.forEach((tree, index) => {
                    const sway = Math.sin(time * 1.5 + index * 0.5) * 0.02;
                    tree.rotation.z = sway;
                    tree.rotation.x = Math.cos(time * 1.2 + index * 0.3) * 0.01;
                });

                // Animate cars
                cars.children.forEach((car) => {
                    if (car.userData.path === 'horizontal') {
                        car.position.x += car.userData.speed * car.userData.direction;

                        // Loop back when out of bounds
                        if (car.userData.direction === 1 && car.position.x > 250) {
                            car.position.x = -250;
                        } else if (car.userData.direction === -1 && car.position.x < -250) {
                            car.position.x = 250;
                        }
                    } else {
                        car.position.z += car.userData.speed * car.userData.direction;

                        // Loop back when out of bounds
                        if (car.userData.direction === 1 && car.position.z > 250) {
                            car.position.z = -250;
                        } else if (car.userData.direction === -1 && car.position.z < -250) {
                            car.position.z = 250;
                        }
                    }

                    // Wheel rotation
                    car.children.forEach((child, i) => {
                        if (i >= 4 && i <= 7) { // Wheels are the last 4 children
                            child.rotation.x += car.userData.speed * 0.1;
                        }
                    });
                });

                // Animate people walking
                people.children.forEach((person) => {
                    person.userData.progress += person.userData.speed * 0.01;

                    // Linear interpolation between start and target
                    const t = person.userData.progress % 2; // Loop between 0-2
                    const actualT = t > 1 ? 2 - t : t; // Ping-pong effect

                    person.position.x = person.userData.startX +
                        (person.userData.targetX - person.userData.startX) * actualT;
                    person.position.z = person.userData.startZ +
                        (person.userData.targetZ - person.userData.startZ) * actualT;

                    // Walking animation (leg movement)
                    const walkCycle = Math.sin(time * 8 + person.userData.speed * 100);
                    if (person.children[2]) person.children[2].rotation.x = walkCycle * 0.3; // Leg 1
                    if (person.children[3]) person.children[3].rotation.x = -walkCycle * 0.3; // Leg 2

                    // Body bob
                    person.children[1].position.y = 3 + Math.abs(walkCycle) * 0.1;
                });

                // Animate traffic lights
                trafficLights.children.forEach((light, index) => {
                    const userData = light.userData;
                    userData.timer += 0.016; // Approximate frame time

                    // Traffic light cycle: green (5s) -> yellow (1s) -> red (5s)
                    const cycleTime = 11; // Total cycle time in seconds
                    const offset = (index % 3) * (cycleTime / 3); // Stagger lights
                    const adjustedTime = (userData.timer + offset) % cycleTime;

                    if (adjustedTime < 5) {
                        // Green phase
                        userData.state = 'green';
                        userData.redLight.material.opacity = 0.2;
                        userData.yellowLight.material.opacity = 0.2;
                        userData.greenLight.material.opacity = 0.9;
                    } else if (adjustedTime < 6) {
                        // Yellow phase
                        userData.state = 'yellow';
                        userData.redLight.material.opacity = 0.2;
                        userData.yellowLight.material.opacity = 0.9;
                        userData.greenLight.material.opacity = 0.2;
                    } else {
                        // Red phase
                        userData.state = 'red';
                        userData.redLight.material.opacity = 0.9;
                        userData.yellowLight.material.opacity = 0.2;
                        userData.greenLight.material.opacity = 0.2;
                    }
                });

                // Animate shop signs (glowing pulse effect) - only at night
                shops.children.forEach((shop) => {
                    const userData = shop.userData;
                    const pulse = Math.sin(time * userData.pulseSpeed) * 0.3 + 0.7;

                    // Main sign pulsing - fades in at night
                    userData.sign.material.opacity = userData.baseOpacity * pulse * nightIntensity;

                    // Glow layers pulsing - fades in at night
                    userData.glowLayers.forEach((glow, index) => {
                        const layerPulse = pulse * (1 - index * 0.2);
                        glow.material.opacity = glow.userData.baseOpacity * layerPulse * nightIntensity;
                    });

                    // Window lights in shops - fades in at night
                    userData.windowLights.forEach((light, index) => {
                        const flicker = Math.sin(time * 3 + index * 0.5) * 0.1 + 0.9;
                        light.material.opacity = 0.7 * flicker * nightIntensity;
                    });
                });

                // Animate street lights (subtle flicker) - only at night
                streetLights.children.forEach((light) => {
                    const userData = light.userData;
                    const flicker = Math.sin(time * userData.flickerSpeed * 10) * 0.1 + 0.9;

                    // Bulb flickering - fades in at night
                    userData.bulb.material.opacity = userData.baseOpacity * flicker * nightIntensity;

                    // Glow layers flickering - fades in at night
                    userData.glowLayers.forEach((glow, index) => {
                        const layerFlicker = flicker * (1 - index * 0.15);
                        glow.material.opacity = glow.userData.baseOpacity * layerFlicker * nightIntensity;
                    });
                });

                // Update shader uniforms
                scene.traverse((child) => {
                    if (child.material && child.material.uniforms) {
                        child.material.uniforms.time.value = time;
                    }
                });

                // Animate construction lines
                constructionLines.children.forEach((line, index) => {
                    const positions = line.geometry.attributes.position.array;
                    const original = line.userData.originalVertices;

                    // Wave animation
                    positions[1] = original[1] + Math.sin(time * line.userData.speed + index) * 10;
                    positions[4] = original[4] + Math.cos(time * line.userData.speed + index) * 10;

                    line.geometry.attributes.position.needsUpdate = true;

                    // Fade in and out
                    line.material.opacity = 0.1 + Math.sin(time + index) * 0.05;
                });

                // Animate particles
                particles.rotation.y = time * 0.05;
                const particlePositions = particles.geometry.attributes.position.array;
                for (let i = 0; i < particlePositions.length; i += 3) {
                    particlePositions[i + 1] += Math.sin(time + i) * 0.2;

                    // Reset if too high
                    if (particlePositions[i + 1] > 200) {
                        particlePositions[i + 1] = 0;
                    }
                }
                particles.geometry.attributes.position.needsUpdate = true;

                // Animate scan line
                scanLine.position.y = ((time * 30) % 200) - 50;
                scanLine.material.opacity = 0.2 - (scanLine.position.y / 200) * 0.15;

                // Animate sketch marks (fade in/out)
                sketchMarks.children.forEach((mark, index) => {
                    mark.material.opacity = 0.15 + Math.sin(time * mark.userData.fadeSpeed + index) * 0.1;
                });

                // Rotate the entire city slowly
                buildings.rotation.y = Math.sin(time * 0.1) * 0.05;

                renderer.render(scene, camera);
            }

            animate();

            // Handle resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

        } catch (error) {
            console.log('3D pencil city initialization failed:', error);
        }
    };
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero3D);
} else {
    initHero3D();
}