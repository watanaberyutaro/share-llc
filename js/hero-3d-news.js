// 3D Hero Background - Mail Being Sucked into Post Box
// Wireframe mail envelopes spiral into a red post box

class Hero3DNews {
    constructor(canvasId) {
        console.log('Hero3DNews constructor called with canvasId:', canvasId);
        this.canvas = document.getElementById(canvasId);
        console.log('Canvas element:', this.canvas);

        if (!this.canvas) {
            console.error('Canvas not found in constructor!');
            return;
        }

        console.log('THREE defined?', typeof THREE);

        this.clock = null;
        this.mailEnvelopes = [];
        this.maxEnvelopes = 12;

        this.loadThreeJS();
    }

    loadThreeJS() {
        console.log('loadThreeJS called, THREE is:', typeof THREE);
        if (typeof THREE !== 'undefined') {
            this.clock = new THREE.Clock();
            this.init();
        } else {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/three@0.128.0/build/three.min.js';
            script.onload = () => {
                console.log('Three.js loaded successfully from unpkg');
                this.clock = new THREE.Clock();
                this.init();
            };
            script.onerror = () => {
                console.error('Failed to load Three.js from unpkg, trying jsdelivr...');
                const script2 = document.createElement('script');
                script2.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
                script2.onload = () => {
                    console.log('Three.js loaded from jsdelivr');
                    this.clock = new THREE.Clock();
                    this.init();
                };
                script2.onerror = () => {
                    console.error('Failed to load Three.js from all CDNs');
                };
                document.head.appendChild(script2);
            };
            document.head.appendChild(script);
        }
    }

    init() {
        console.log('Initializing Three.js scene...');

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            this.canvas.offsetWidth / this.canvas.offsetHeight,
            0.1,
            1000
        );
        // Fixed camera position - 30 degrees diagonal view
        this.camera.position.set(10, 6, 10);
        this.camera.lookAt(0, 3, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0xffffff, 1); // White background

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

        // Create SHARE building
        this.createBuilding();

        // Create post box near entrance
        this.createPostBox();

        // Create tree near building
        this.createTree();

        // Create ground
        this.createGround();

        // Create initial mail envelopes
        for (let i = 0; i < this.maxEnvelopes; i++) {
            setTimeout(() => {
                this.createMailEnvelope();
            }, i * 400); // Stagger creation
        }

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation
        this.animate();

        console.log('Three.js scene initialized successfully');
    }

    createBuilding() {
        const building = new THREE.Group();

        // Black material for building
        const buildingMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8
        });

        // Main building body (10 floors) - larger building
        const bodyGeometry = new THREE.BoxGeometry(8, 12, 8);
        const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
        const body = new THREE.LineSegments(bodyEdges, buildingMaterial);
        body.position.y = 6;
        building.add(body);

        // Windows - 10 floors, 5x5 windows per floor on front face
        for (let floor = 0; floor < 10; floor++) {
            for (let x = -2; x <= 2; x++) {
                const skipEntrance = (floor === 0 && x >= -1 && x <= 1); // Skip entrance area on ground floor

                if (!skipEntrance) {
                    const windowGeometry = new THREE.PlaneGeometry(0.6, 0.8);
                    const windowEdges = new THREE.EdgesGeometry(windowGeometry);
                    const window1 = new THREE.LineSegments(windowEdges, buildingMaterial);
                    window1.position.set(x * 1.4, 0.8 + floor * 1.2, 4.01);
                    building.add(window1);
                }
            }
        }

        // Entrance door
        const doorGeometry = new THREE.PlaneGeometry(1.5, 2.5);
        const doorEdges = new THREE.EdgesGeometry(doorGeometry);
        const door = new THREE.LineSegments(doorEdges, buildingMaterial);
        door.position.set(0, 1.25, 4.01);
        building.add(door);

        // Entrance area frame
        const entranceGeometry = new THREE.PlaneGeometry(2.5, 3.0);
        const entranceEdges = new THREE.EdgesGeometry(entranceGeometry);
        const entrance = new THREE.LineSegments(entranceEdges, buildingMaterial);
        entrance.position.set(0, 1.5, 4.02);
        building.add(entrance);

        // SHARE sign - white text on black background
        const signGroup = new THREE.Group();

        // Sign background - solid black (larger)
        const signBgGeometry = new THREE.PlaneGeometry(5.0, 1.2);
        const signBgMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });
        const signBg = new THREE.Mesh(signBgGeometry, signBgMaterial);
        signGroup.add(signBg);

        // Sign border
        const signBorderEdges = new THREE.EdgesGeometry(signBgGeometry);
        const signBorderMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2
        });
        const signBorder = new THREE.LineSegments(signBorderEdges, signBorderMaterial);
        signBorder.position.z = 0.01;
        signGroup.add(signBorder);

        // SHARE text - white wireframe (larger)
        const textMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2
        });

        const letterSpacing = 0.7;
        // S
        this.drawLetter(signGroup, 'S', -2 * letterSpacing, 0, 0.02, textMaterial);
        // H
        this.drawLetter(signGroup, 'H', -1 * letterSpacing, 0, 0.02, textMaterial);
        // A
        this.drawLetter(signGroup, 'A', 0, 0, 0.02, textMaterial);
        // R
        this.drawLetter(signGroup, 'R', 1 * letterSpacing, 0, 0.02, textMaterial);
        // E
        this.drawLetter(signGroup, 'E', 2 * letterSpacing, 0, 0.02, textMaterial);

        signGroup.position.set(0, 10.5, 4.05);
        building.add(signGroup);

        building.position.set(0, 0, -2);
        this.scene.add(building);
        this.building = building;
    }

    drawLetter(parent, letter, x, y, z, material) {
        const points = [];
        const height = 0.4;
        const width = 0.3;

        switch (letter) {
            case 'S':
                points.push(
                    new THREE.Vector3(x + width/2, y + height/2, z),
                    new THREE.Vector3(x - width/2, y + height/2, z),
                    new THREE.Vector3(x - width/2, y, z),
                    new THREE.Vector3(x + width/2, y, z),
                    new THREE.Vector3(x + width/2, y - height/2, z),
                    new THREE.Vector3(x - width/2, y - height/2, z)
                );
                break;
            case 'H':
                points.push(
                    new THREE.Vector3(x - width/2, y + height/2, z),
                    new THREE.Vector3(x - width/2, y - height/2, z)
                );
                points.push(new THREE.Vector3(x - width/2, y, z));
                points.push(new THREE.Vector3(x + width/2, y, z));
                points.push(new THREE.Vector3(x + width/2, y + height/2, z));
                points.push(new THREE.Vector3(x + width/2, y - height/2, z));
                break;
            case 'A':
                points.push(
                    new THREE.Vector3(x - width/2, y - height/2, z),
                    new THREE.Vector3(x, y + height/2, z),
                    new THREE.Vector3(x + width/2, y - height/2, z)
                );
                points.push(new THREE.Vector3(x - width/3, y, z));
                points.push(new THREE.Vector3(x + width/3, y, z));
                break;
            case 'R':
                points.push(
                    new THREE.Vector3(x - width/2, y - height/2, z),
                    new THREE.Vector3(x - width/2, y + height/2, z),
                    new THREE.Vector3(x + width/2, y + height/2, z),
                    new THREE.Vector3(x + width/2, y, z),
                    new THREE.Vector3(x - width/2, y, z)
                );
                points.push(new THREE.Vector3(x, y, z));
                points.push(new THREE.Vector3(x + width/2, y - height/2, z));
                break;
            case 'E':
                points.push(
                    new THREE.Vector3(x + width/2, y + height/2, z),
                    new THREE.Vector3(x - width/2, y + height/2, z),
                    new THREE.Vector3(x - width/2, y - height/2, z),
                    new THREE.Vector3(x + width/2, y - height/2, z)
                );
                points.push(new THREE.Vector3(x - width/2, y, z));
                points.push(new THREE.Vector3(x + width/2, y, z));
                break;
        }

        if (points.length > 0) {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            parent.add(line);
        }
    }

    createPostBox() {
        const postBox = new THREE.Group();

        // Red material for post box
        const postMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.9
        });

        // Main body - rectangular box (Japanese style)
        const bodyGeometry = new THREE.BoxGeometry(1.0, 1.2, 0.6);
        const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
        const body = new THREE.LineSegments(bodyEdges, postMaterial);
        body.position.y = 1.6;
        postBox.add(body);

        // Top cap (slanted roof)
        const roofGeometry = new THREE.BoxGeometry(1.1, 0.15, 0.7);
        const roofEdges = new THREE.EdgesGeometry(roofGeometry);
        const roof = new THREE.LineSegments(roofEdges, postMaterial);
        roof.position.y = 2.275;
        postBox.add(roof);

        // Mail slot (horizontal rectangle on front)
        const slotGeometry = new THREE.PlaneGeometry(0.6, 0.08);
        const slotEdges = new THREE.EdgesGeometry(slotGeometry);
        const slot = new THREE.LineSegments(slotEdges, postMaterial);
        slot.position.set(0, 1.8, 0.31);
        postBox.add(slot);

        // Cylindrical pole (single support)
        const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8);
        const poleEdges = new THREE.EdgesGeometry(poleGeometry);
        const pole = new THREE.LineSegments(poleEdges, postMaterial);
        pole.position.y = 0.5;
        postBox.add(pole);

        // Base platform
        const baseGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.1, 8);
        const baseEdges = new THREE.EdgesGeometry(baseGeometry);
        const base = new THREE.LineSegments(baseEdges, postMaterial);
        base.position.y = 0.05;
        postBox.add(base);

        // Postal mark 〒 on the front
        this.createPostalMark(postBox, postMaterial);

        // Position post box near building entrance (to the right side)
        postBox.position.set(3.5, 0, 2.5);
        this.scene.add(postBox);
        this.postBox = postBox;
        this.postBoxPosition = new THREE.Vector3(3.5, 0, 2.5);
    }

    createTree() {
        const tree = new THREE.Group();

        // Black/brown material for tree
        const trunkMaterial = new THREE.LineBasicMaterial({
            color: 0x4a3020, // Brown
            transparent: true,
            opacity: 0.8
        });

        const leafMaterial = new THREE.LineBasicMaterial({
            color: 0x2d5016, // Green
            transparent: true,
            opacity: 0.8
        });

        // Tree trunk (cylinder)
        const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, 3.5, 8);
        const trunkEdges = new THREE.EdgesGeometry(trunkGeometry);
        const trunk = new THREE.LineSegments(trunkEdges, trunkMaterial);
        trunk.position.y = 1.75;
        tree.add(trunk);

        // Tree canopy - multiple cone layers
        const canopyLayers = [
            { y: 3.5, radiusTop: 0.2, radiusBottom: 1.2, height: 1.5 },
            { y: 4.5, radiusTop: 0.2, radiusBottom: 1.0, height: 1.2 },
            { y: 5.3, radiusTop: 0, radiusBottom: 0.8, height: 1.0 }
        ];

        canopyLayers.forEach(layer => {
            const coneGeometry = new THREE.ConeGeometry(layer.radiusBottom, layer.height, 8);
            const coneEdges = new THREE.EdgesGeometry(coneGeometry);
            const cone = new THREE.LineSegments(coneEdges, leafMaterial);
            cone.position.y = layer.y;
            tree.add(cone);
        });

        // Position tree to the left side of building entrance
        tree.position.set(-3.5, 0, 2);
        this.scene.add(tree);
        this.tree = tree;
    }

    createPostalMark(parent, material) {
        const markGroup = new THREE.Group();

        // 〒 mark - simplified wireframe version
        // Horizontal top line
        const topLine = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.2, 0.2, 0),
            new THREE.Vector3(0.2, 0.2, 0)
        ]);
        const topMark = new THREE.Line(topLine, material);
        markGroup.add(topMark);

        // Vertical center line
        const verticalLine = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.2, 0),
            new THREE.Vector3(0, -0.2, 0)
        ]);
        const verticalMark = new THREE.Line(verticalLine, material);
        markGroup.add(verticalMark);

        // Bottom horizontal line (shorter)
        const bottomLine = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.15, -0.2, 0),
            new THREE.Vector3(0.15, -0.2, 0)
        ]);
        const bottomMark = new THREE.Line(bottomLine, material);
        markGroup.add(bottomMark);

        markGroup.position.set(0, 1.4, 0.31);
        parent.add(markGroup);
    }

    createMailEnvelope() {
        const envelope = new THREE.Group();

        // Black material for mail
        const mailMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8
        });

        // Envelope body (flat box)
        const bodyGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.05);
        const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
        const body = new THREE.LineSegments(bodyEdges, mailMaterial);
        envelope.add(body);

        // Envelope flap (triangle on top)
        const flapPoints = [
            new THREE.Vector3(-0.2, 0.125, 0.025),
            new THREE.Vector3(0.2, 0.125, 0.025),
            new THREE.Vector3(0, 0.225, 0.025),
            new THREE.Vector3(-0.2, 0.125, 0.025)
        ];
        const flapGeometry = new THREE.BufferGeometry().setFromPoints(flapPoints);
        const flap = new THREE.Line(flapGeometry, mailMaterial);
        envelope.add(flap);

        // Bottom flap lines
        const bottomFlapPoints = [
            new THREE.Vector3(-0.2, -0.125, 0.025),
            new THREE.Vector3(0, -0.025, 0.025),
            new THREE.Vector3(0.2, -0.125, 0.025)
        ];
        const bottomFlapGeometry = new THREE.BufferGeometry().setFromPoints(bottomFlapPoints);
        const bottomFlap = new THREE.Line(bottomFlapGeometry, mailMaterial);
        envelope.add(bottomFlap);

        // Starting position - random position in a circle around post box
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 3;
        const height = 1 + Math.random() * 4;

        // Position relative to post box location (3.5, 0, 2.5)
        envelope.position.set(
            3.5 + Math.cos(angle) * radius,
            height,
            2.5 + Math.sin(angle) * radius
        );

        // Random initial rotation
        envelope.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // Store animation data
        envelope.userData = {
            age: 0,
            startAngle: angle,
            startRadius: radius,
            startHeight: height,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                z: (Math.random() - 0.5) * 2
            },
            spiralSpeed: 0.3 + Math.random() * 0.3
        };

        this.mailEnvelopes.push(envelope);
        this.scene.add(envelope);
    }

    createGround() {
        // Wireframe grid ground
        const gridSize = 15;
        const gridDivisions = 15;

        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x000000);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.15;
        this.scene.add(gridHelper);

        // Plane outline
        const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
        const planeEdges = new THREE.EdgesGeometry(planeGeometry);
        const planeMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.1
        });
        const plane = new THREE.LineSegments(planeEdges, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.05;
        this.scene.add(plane);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.clock) return;

        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        this.update(deltaTime, elapsedTime);
    }

    update(deltaTime, time) {
        // Update mail envelopes - spiral toward post box
        for (let i = this.mailEnvelopes.length - 1; i >= 0; i--) {
            const envelope = this.mailEnvelopes[i];
            envelope.userData.age += deltaTime;

            const progress = envelope.userData.age * envelope.userData.spiralSpeed;

            // Spiral motion toward post box at (3.5, 0, 2.5)
            const currentAngle = envelope.userData.startAngle + progress * 3;
            const currentRadius = envelope.userData.startRadius * (1 - Math.min(progress, 1));
            const currentHeight = envelope.userData.startHeight * (1 - Math.min(progress, 1)) + 1.2;

            envelope.position.x = 3.5 + Math.cos(currentAngle) * currentRadius;
            envelope.position.y = currentHeight;
            envelope.position.z = 2.5 + Math.sin(currentAngle) * currentRadius;

            // Rotate envelope
            envelope.rotation.x += envelope.userData.rotationSpeed.x * deltaTime;
            envelope.rotation.y += envelope.userData.rotationSpeed.y * deltaTime;
            envelope.rotation.z += envelope.userData.rotationSpeed.z * deltaTime;

            // Fade out as approaching post box (at position 3.5, 0, 2.5)
            const dx = envelope.position.x - 3.5;
            const dz = envelope.position.z - 2.5;
            const distanceToPost = Math.sqrt(dx * dx + dz * dz);

            if (distanceToPost < 0.8 || envelope.position.y < 0.8) {
                // Fade out
                const fadeProgress = Math.max(0, Math.min(1, (0.8 - distanceToPost) / 0.8));
                envelope.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = 0.8 * (1 - fadeProgress);
                    }
                });

                // Remove when reached post box
                if (distanceToPost < 0.6 || envelope.position.y < 0.7) {
                    this.scene.remove(envelope);
                    this.mailEnvelopes.splice(i, 1);

                    // Create new envelope
                    this.createMailEnvelope();
                }
            }
        }

        // Camera is fixed - no rotation

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    onWindowResize() {
        this.camera.aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, looking for canvas...');
    const canvas = document.getElementById('hero-3d-canvas');
    console.log('Canvas found:', canvas);
    if (canvas) {
        console.log('Creating Hero3DNews instance');
        new Hero3DNews('hero-3d-canvas');
    } else {
        console.error('Canvas element #hero-3d-canvas not found!');
    }
});
