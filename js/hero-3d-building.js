class Hero3DBuilding {
    constructor(canvasId) {
        console.log('Hero3DBuilding constructor called with canvasId:', canvasId);
        this.canvas = document.getElementById(canvasId);
        console.log('Canvas element:', this.canvas);

        if (!this.canvas) {
            console.error('Canvas element not found in constructor!');
            return;
        }

        if (this.canvas.offsetWidth === 0 || this.canvas.offsetHeight === 0) {
            console.error('Canvas has no dimensions:', {
                width: this.canvas.offsetWidth,
                height: this.canvas.offsetHeight
            });
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.building = null;
        this.people = [];
        this.cars = [];
        this.pedestrians = [];
        this.signboard = null;
        this.clock = null;

        this.loadThreeJS();
    }

    loadThreeJS() {
        console.log('loadThreeJS called, THREE is:', typeof THREE);

        if (typeof THREE !== 'undefined') {
            console.log('THREE already loaded');
            this.clock = new THREE.Clock();
            this.init();
            return;
        }

        console.log('Loading THREE from CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => {
            console.log('THREE script loaded, THREE is:', typeof THREE);
            if (typeof THREE !== 'undefined') {
                this.clock = new THREE.Clock();
                this.init();
            } else {
                console.error('Three.js failed to load');
            }
        };
        script.onerror = (error) => {
            console.error('Failed to load Three.js from CDN:', error);
        };
        document.head.appendChild(script);
    }

    init() {
        try {
            console.log('Init called');


            // Get canvas size
            const width = this.canvas.offsetWidth || this.canvas.parentElement.offsetWidth || window.innerWidth;
            const height = this.canvas.offsetHeight || this.canvas.parentElement.offsetHeight || window.innerHeight * 0.6;

            console.log('Canvas dimensions:', { width, height });

            if (width === 0 || height === 0) {
                console.error('Canvas still has no dimensions, using fallback');
                // Use fallback dimensions
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight * 0.6;
            }

            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xffffff); // White background
            console.log('Scene created with white background');

            // Camera setup
            const aspect = width / height;
            this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
            this.camera.position.set(15, 8, 15);
            this.camera.lookAt(0, 3, 0);
            console.log('Camera created');

            // Renderer setup
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                alpha: false // Solid background, not transparent
            });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setClearColor(0xffffff, 1); // White background
            console.log('Renderer created with white clear color');

            // Create scene elements
            console.log('Creating building...');
            this.createBuilding();
            console.log('Creating signboard...');
            this.createSignboard();
            console.log('Creating trees...');
            this.createTrees();
            console.log('Creating people...');
            this.createPeople();
            console.log('Creating cars...');
            this.createCars();
            console.log('Creating pedestrians...');
            this.createPedestrians();

            // Handle resize
            window.addEventListener('resize', () => this.onResize());

            // Force initial render
            this.renderer.render(this.scene, this.camera);
            console.log('Initial render complete');

            // Start animation
            console.log('Starting animation loop...');
            this.animate();

            console.log('Hero 3D Building initialized successfully');
        } catch (error) {
            console.error('Error initializing 3D scene:', error);
            console.error('Stack trace:', error.stack);
        }
    }

    createBuilding() {
        const buildingGroup = new THREE.Group();

        // Main building structure (5 floors)
        const buildingGeometry = new THREE.BoxGeometry(6, 10, 4);
        const buildingEdges = new THREE.EdgesGeometry(buildingGeometry);
        const buildingLines = new THREE.LineSegments(
            buildingEdges,
            new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 })
        );
        buildingLines.position.set(0, 5, 0);
        buildingGroup.add(buildingLines);

        // Windows (grid pattern)
        for (let floor = 0; floor < 5; floor++) {
            for (let col = 0; col < 4; col++) {
                const windowGeometry = new THREE.PlaneGeometry(0.8, 1);
                const windowEdges = new THREE.EdgesGeometry(windowGeometry);
                const windowLines = new THREE.LineSegments(
                    windowEdges,
                    new THREE.LineBasicMaterial({ color: 0x000000 })
                );
                windowLines.position.set(-2.2 + col * 1.5, 1.5 + floor * 2, 2.01);
                buildingGroup.add(windowLines);
            }
        }

        // Entrance (double door)
        const doorGeometry = new THREE.BoxGeometry(2, 2.5, 0.2);
        const doorEdges = new THREE.EdgesGeometry(doorGeometry);
        const doorLines = new THREE.LineSegments(
            doorEdges,
            new THREE.LineBasicMaterial({ color: 0x000000 })
        );
        doorLines.position.set(0, 1.25, 2.1);
        buildingGroup.add(doorLines);

        // Entrance step
        const stepGeometry = new THREE.BoxGeometry(3, 0.2, 1);
        const stepEdges = new THREE.EdgesGeometry(stepGeometry);
        const stepLines = new THREE.LineSegments(
            stepEdges,
            new THREE.LineBasicMaterial({ color: 0x000000 })
        );
        stepLines.position.set(0, 0.1, 2.5);
        buildingGroup.add(stepLines);

        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(30, 30);
        const groundEdges = new THREE.EdgesGeometry(groundGeometry);
        const groundLines = new THREE.LineSegments(
            groundEdges,
            new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 })
        );
        groundLines.rotation.x = -Math.PI / 2;
        groundLines.position.y = 0;
        buildingGroup.add(groundLines);

        // Road lines
        for (let i = -3; i <= 3; i++) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i * 2, 0.01, -15),
                new THREE.Vector3(i * 2, 0.01, 15)
            ]);
            const line = new THREE.Line(
                lineGeometry,
                new THREE.LineBasicMaterial({ color: 0x666666 })
            );
            buildingGroup.add(line);
        }

        this.building = buildingGroup;
        this.scene.add(this.building);
    }

    createSignboard() {
        const signGroup = new THREE.Group();

        // Signboard background
        const signGeometry = new THREE.BoxGeometry(4, 1, 0.2);
        const signEdges = new THREE.EdgesGeometry(signGeometry);
        const signLines = new THREE.LineSegments(
            signEdges,
            new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
        );
        signLines.position.set(0, 11, 0.5);
        signGroup.add(signLines);

        // Create "SHARE" text using simple lines
        const textMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

        // S
        const sPoints = [
            new THREE.Vector3(-1.8, 11.4, 0.7),
            new THREE.Vector3(-1.3, 11.4, 0.7),
            new THREE.Vector3(-1.3, 11.2, 0.7),
            new THREE.Vector3(-1.8, 11.2, 0.7),
            new THREE.Vector3(-1.8, 11.0, 0.7),
            new THREE.Vector3(-1.3, 11.0, 0.7),
            new THREE.Vector3(-1.3, 10.8, 0.7),
            new THREE.Vector3(-1.8, 10.8, 0.7)
        ];
        const sGeometry = new THREE.BufferGeometry().setFromPoints(sPoints);
        const sLine = new THREE.Line(sGeometry, textMaterial);
        signGroup.add(sLine);

        // H
        const hGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-1.0, 10.8, 0.7),
            new THREE.Vector3(-1.0, 11.4, 0.7)
        ]);
        const hGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-1.0, 11.1, 0.7),
            new THREE.Vector3(-0.5, 11.1, 0.7)
        ]);
        const hGeometry3 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.5, 10.8, 0.7),
            new THREE.Vector3(-0.5, 11.4, 0.7)
        ]);
        signGroup.add(new THREE.Line(hGeometry1, textMaterial));
        signGroup.add(new THREE.Line(hGeometry2, textMaterial));
        signGroup.add(new THREE.Line(hGeometry3, textMaterial));

        // A
        const aGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.3, 10.8, 0.7),
            new THREE.Vector3(-0.05, 11.4, 0.7),
            new THREE.Vector3(0.2, 10.8, 0.7)
        ]);
        const aGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.2, 11.0, 0.7),
            new THREE.Vector3(0.1, 11.0, 0.7)
        ]);
        signGroup.add(new THREE.Line(aGeometry1, textMaterial));
        signGroup.add(new THREE.Line(aGeometry2, textMaterial));

        // R
        const rGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0.4, 10.8, 0.7),
            new THREE.Vector3(0.4, 11.4, 0.7),
            new THREE.Vector3(0.9, 11.4, 0.7),
            new THREE.Vector3(0.9, 11.1, 0.7),
            new THREE.Vector3(0.4, 11.1, 0.7)
        ]);
        const rGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0.65, 11.1, 0.7),
            new THREE.Vector3(0.9, 10.8, 0.7)
        ]);
        signGroup.add(new THREE.Line(rGeometry1, textMaterial));
        signGroup.add(new THREE.Line(rGeometry2, textMaterial));

        // E
        const eGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(1.5, 10.8, 0.7),
            new THREE.Vector3(1.1, 10.8, 0.7),
            new THREE.Vector3(1.1, 11.4, 0.7),
            new THREE.Vector3(1.5, 11.4, 0.7)
        ]);
        const eGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(1.1, 11.1, 0.7),
            new THREE.Vector3(1.4, 11.1, 0.7)
        ]);
        signGroup.add(new THREE.Line(eGeometry, textMaterial));
        signGroup.add(new THREE.Line(eGeometry2, textMaterial));

        this.signboard = signGroup;
        this.scene.add(this.signboard);
    }

    createTree(x, y, z) {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 12);
        const trunkEdges = new THREE.EdgesGeometry(trunkGeometry);
        const trunk = new THREE.LineSegments(
            trunkEdges,
            new THREE.LineBasicMaterial({ color: 0x4a3728 }) // Dark wood
        );
        trunk.position.set(0, 2, 0);
        treeGroup.add(trunk);

        // Leaves - 4 layers for full tree crown
        const leavesColors = [0x2d5016, 0x2d5016, 0x2d5016, 0x2d5016];
        const leafSizes = [1.5, 1.3, 1.1, 0.9];
        const leafHeights = [4.5, 5.0, 5.5, 6.0];

        for (let i = 0; i < 4; i++) {
            const leavesGeometry = new THREE.SphereGeometry(leafSizes[i], 16, 12);
            const leavesEdges = new THREE.EdgesGeometry(leavesGeometry);
            const leaves = new THREE.LineSegments(
                leavesEdges,
                new THREE.LineBasicMaterial({ color: leavesColors[i] })
            );
            leaves.position.set(0, leafHeights[i], 0);
            treeGroup.add(leaves);
        }

        treeGroup.position.set(x, y, z);
        return treeGroup;
    }

    createTrees() {
        // Add multiple trees around the scene
        const treePositions = [
            { x: -8, z: 8 },
            { x: 8, z: 8 },
            { x: -10, z: -8 },
            { x: 10, z: -8 },
            { x: -12, z: 0 }
        ];

        treePositions.forEach(pos => {
            const tree = this.createTree(pos.x, 0, pos.z);
            this.scene.add(tree);
        });
    }

    createPerson(x, y, z, shirtColor = 0x2563eb, pantsColor = 0x1e293b) {
        const personGroup = new THREE.Group();

        // Head
        const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const headEdges = new THREE.EdgesGeometry(headGeometry);
        const head = new THREE.LineSegments(
            headEdges,
            new THREE.LineBasicMaterial({ color: 0x000000 }) // Black wireframe
        );
        head.position.set(0, 0.9, 0);
        personGroup.add(head);

        // Body (shirt)
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8);
        const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
        const body = new THREE.LineSegments(
            bodyEdges,
            new THREE.LineBasicMaterial({ color: shirtColor }) // Colored shirt
        );
        body.position.set(0, 0.4, 0);
        personGroup.add(body);

        // Legs (pants)
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6);
        const legEdges = new THREE.EdgesGeometry(legGeometry);

        const leftLeg = new THREE.LineSegments(
            legEdges,
            new THREE.LineBasicMaterial({ color: pantsColor }) // Colored pants
        );
        leftLeg.position.set(-0.1, -0.15, 0);
        personGroup.add(leftLeg);

        const rightLeg = new THREE.LineSegments(
            legEdges.clone(),
            new THREE.LineBasicMaterial({ color: pantsColor }) // Colored pants
        );
        rightLeg.position.set(0.1, -0.15, 0);
        personGroup.add(rightLeg);

        personGroup.position.set(x, y, z);
        return personGroup;
    }

    createPeople() {
        // People entering/exiting building with different colored clothes
        const shirtColors = [0x2563eb, 0xdc2626, 0x16a34a]; // Blue, Red, Green
        const pantsColors = [0x1e293b, 0x374151, 0x064e3b]; // Dark blue, Gray, Dark green

        for (let i = 0; i < 3; i++) {
            const person = this.createPerson(0, 0.5, 3 + i * 2, shirtColors[i], pantsColors[i]);
            person.userData = {
                direction: i % 2 === 0 ? 1 : -1,
                speed: 1.0 + Math.random() * 0.5, // Increased speed
                minZ: -2,
                maxZ: 8,
                baseY: 0.5
            };
            this.people.push(person);
            this.scene.add(person);
        }
    }

    createCar(x, y, z, carColor = 0x000000) {
        const carGroup = new THREE.Group();

        // Car body
        const bodyGeometry = new THREE.BoxGeometry(1.5, 0.6, 0.8);
        const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
        const body = new THREE.LineSegments(
            bodyEdges,
            new THREE.LineBasicMaterial({ color: carColor }) // Colored car body
        );
        body.position.set(0, 0.3, 0);
        carGroup.add(body);

        // Car roof
        const roofGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.7);
        const roofEdges = new THREE.EdgesGeometry(roofGeometry);
        const roof = new THREE.LineSegments(
            roofEdges,
            new THREE.LineBasicMaterial({ color: carColor }) // Same color as body
        );
        roof.position.set(-0.1, 0.8, 0);
        carGroup.add(roof);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
        const wheelEdges = new THREE.EdgesGeometry(wheelGeometry);

        const wheels = [
            { x: 0.5, z: 0.5 },
            { x: 0.5, z: -0.5 },
            { x: -0.5, z: 0.5 },
            { x: -0.5, z: -0.5 }
        ];

        wheels.forEach(pos => {
            const wheel = new THREE.LineSegments(
                wheelEdges.clone(),
                new THREE.LineBasicMaterial({ color: 0x000000 })
            );
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.15, pos.z);
            carGroup.add(wheel);
        });

        carGroup.position.set(x, y, z);
        return carGroup;
    }

    createCars() {
        // Cars driving on the road with different colors
        const carColors = [0xef4444, 0x3b82f6]; // Red, Blue

        for (let i = 0; i < 2; i++) {
            const car = this.createCar(-8 - i * 5, 0.2, -6 + i * 2, carColors[i]);
            car.userData = {
                speed: 4 + Math.random() * 2, // Increased speed
                lane: -6 + i * 2
            };
            this.cars.push(car);
            this.scene.add(car);
        }
    }

    createPedestrians() {
        // Walking people with different colored clothes
        const shirtColors = [0xf59e0b, 0x8b5cf6, 0xec4899, 0x14b8a6]; // Orange, Purple, Pink, Teal
        const pantsColors = [0x78716c, 0x0f172a, 0x44403c, 0x0c4a6e]; // Stone, Dark slate, Gray, Dark cyan

        for (let i = 0; i < 4; i++) {
            const pedestrian = this.createPerson(-10 + i * 3, 0.5, 6, shirtColors[i], pantsColors[i]);
            pedestrian.userData = {
                speed: 1.0 + Math.random() * 0.5, // Increased speed
                direction: i % 2 === 0 ? 1 : -1,
                baseX: -10 + i * 3,
                range: 10 // Increased range
            };
            this.pedestrians.push(pedestrian);
            this.scene.add(pedestrian);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Rotate camera around building center
        const radius = 20;
        const cameraSpeed = 0.2;
        const angle = time * cameraSpeed;
        this.camera.position.x = Math.cos(angle) * radius;
        this.camera.position.z = Math.sin(angle) * radius;
        this.camera.position.y = 10;
        this.camera.lookAt(0, 4, 0); // Look at building center

        // Animate people entering/exiting
        this.people.forEach(person => {
            person.position.z += person.userData.direction * person.userData.speed * delta;

            if (person.position.z > person.userData.maxZ) {
                person.userData.direction = -1;
            } else if (person.position.z < person.userData.minZ) {
                person.userData.direction = 1;
            }

            // Walking animation
            person.rotation.y = person.userData.direction > 0 ? Math.PI : 0;
            if (person.children[2]) person.children[2].rotation.x = Math.sin(time * 5) * 0.3; // Left leg
            if (person.children[3]) person.children[3].rotation.x = Math.sin(time * 5 + Math.PI) * 0.3; // Right leg
        });

        // Animate cars
        this.cars.forEach(car => {
            car.position.x += car.userData.speed * delta;

            if (car.position.x > 15) {
                car.position.x = -15;
            }
        });

        // Animate pedestrians
        this.pedestrians.forEach(pedestrian => {
            pedestrian.position.x += pedestrian.userData.direction * pedestrian.userData.speed * delta;

            const distance = Math.abs(pedestrian.position.x - pedestrian.userData.baseX);
            if (distance > pedestrian.userData.range) {
                pedestrian.userData.direction *= -1;
            }

            // Walking animation
            pedestrian.rotation.y = pedestrian.userData.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
            if (pedestrian.children[2]) pedestrian.children[2].rotation.x = Math.sin(time * 4) * 0.3;
            if (pedestrian.children[3]) pedestrian.children[3].rotation.x = Math.sin(time * 4 + Math.PI) * 0.3;
        });

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, looking for canvas...');
    const canvas = document.getElementById('hero-3d-canvas');
    console.log('Canvas found:', canvas);
    if (canvas) {
        console.log('Creating Hero3DBuilding instance');
        new Hero3DBuilding('hero-3d-canvas');
    } else {
        console.error('Canvas element #hero-3d-canvas not found!');
    }
});
