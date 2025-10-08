class LoadingAnimation {
    constructor() {
        this.canvas = document.getElementById('loading-canvas');
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressText = document.querySelector('.loading-progress');

        if (!this.canvas || !this.loadingScreen) {
            console.error('Loading elements not found');
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.buildingParts = [];
        this.confetti = [];
        this.startTime = Date.now();
        this.duration = 5000; // 5 seconds
        this.isComplete = false;
        this.celebrationStarted = false;

        this.loadThreeJS();
    }

    loadThreeJS() {
        if (typeof THREE !== 'undefined') {
            this.init();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => {
            if (typeof THREE !== 'undefined') {
                this.init();
            }
        };
        script.onerror = () => {
            console.error('Failed to load Three.js');
            this.completeLoading();
        };
        document.head.appendChild(script);
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        // Camera setup - wider view to show everything
        const aspect = this.canvas.offsetWidth / this.canvas.offsetHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(18, 12, 18);
        this.camera.lookAt(0, 6, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Create building parts
        this.createBuildingParts();

        // Start animation
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }

    createBuildingParts() {
        const material = new THREE.LineBasicMaterial({ color: 0x000000 });

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundEdges = new THREE.EdgesGeometry(groundGeometry);
        const ground = new THREE.LineSegments(groundEdges, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        this.buildingParts.push({ mesh: ground, delay: 0, duration: 0.3 });

        // Foundation
        const foundationGeometry = new THREE.BoxGeometry(6.2, 0.5, 4.2);
        const foundationEdges = new THREE.EdgesGeometry(foundationGeometry);
        const foundation = new THREE.LineSegments(foundationEdges, material);
        foundation.position.set(0, 0.25, 0);
        this.buildingParts.push({ mesh: foundation, delay: 0.3, duration: 0.3 });

        // Building floors (5 floors, 2 units each)
        for (let floor = 0; floor < 5; floor++) {
            const floorGeometry = new THREE.BoxGeometry(6, 2, 4);
            const floorEdges = new THREE.EdgesGeometry(floorGeometry);
            const floorMesh = new THREE.LineSegments(floorEdges, material);
            floorMesh.position.set(0, 1.5 + floor * 2, 0);
            this.buildingParts.push({
                mesh: floorMesh,
                delay: 0.6 + floor * 0.4,
                duration: 0.3
            });

            // Windows for each floor
            for (let col = 0; col < 4; col++) {
                const windowGeometry = new THREE.PlaneGeometry(0.8, 1);
                const windowEdges = new THREE.EdgesGeometry(windowGeometry);
                const window = new THREE.LineSegments(windowEdges, material);
                window.position.set(-2.2 + col * 1.5, 1.5 + floor * 2, 2.01);
                this.buildingParts.push({
                    mesh: window,
                    delay: 0.7 + floor * 0.4,
                    duration: 0.2
                });
            }
        }

        // Entrance
        const doorGeometry = new THREE.BoxGeometry(2, 2.5, 0.2);
        const doorEdges = new THREE.EdgesGeometry(doorGeometry);
        const door = new THREE.LineSegments(doorEdges, material);
        door.position.set(0, 1.75, 2.1);
        this.buildingParts.push({ mesh: door, delay: 2.4, duration: 0.3 });

        // Signboard frame
        const signGeometry = new THREE.BoxGeometry(4, 1, 0.2);
        const signEdges = new THREE.EdgesGeometry(signGeometry);
        const sign = new THREE.LineSegments(signEdges, material);
        sign.position.set(0, 11, 0.5);
        this.buildingParts.push({ mesh: sign, delay: 2.8, duration: 0.2 });

        // Signboard support poles
        const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const poleEdges = new THREE.EdgesGeometry(poleGeometry);

        const leftPole = new THREE.LineSegments(poleEdges, material);
        leftPole.position.set(-1.8, 10.5, 0.5);
        this.buildingParts.push({ mesh: leftPole, delay: 2.7, duration: 0.1 });

        const rightPole = new THREE.LineSegments(poleEdges.clone(), material);
        rightPole.position.set(1.8, 10.5, 0.5);
        this.buildingParts.push({ mesh: rightPole, delay: 2.7, duration: 0.1 });

        // "SHARE" text (simplified)
        const textMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });

        // S
        const sPoints = [
            new THREE.Vector3(-1.8, 11.4, 0.7),
            new THREE.Vector3(-1.3, 11.4, 0.7),
            new THREE.Vector3(-1.3, 11.2, 0.7),
            new THREE.Vector3(-1.8, 11.2, 0.7),
            new THREE.Vector3(-1.8, 11.0, 0.7),
            new THREE.Vector3(-1.3, 11.0, 0.7)
        ];
        const sGeometry = new THREE.BufferGeometry().setFromPoints(sPoints);
        const sLine = new THREE.Line(sGeometry, textMaterial);
        this.buildingParts.push({ mesh: sLine, delay: 2.8, duration: 0.04 });

        // H
        const hGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-1.0, 10.8, 0.7),
            new THREE.Vector3(-1.0, 11.4, 0.7)
        ]);
        const hLine1 = new THREE.Line(hGeometry1, textMaterial);
        this.buildingParts.push({ mesh: hLine1, delay: 2.84, duration: 0.04 });

        const hGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-1.0, 11.1, 0.7),
            new THREE.Vector3(-0.5, 11.1, 0.7)
        ]);
        const hLine2 = new THREE.Line(hGeometry2, textMaterial);
        this.buildingParts.push({ mesh: hLine2, delay: 2.88, duration: 0.02 });

        const hGeometry3 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.5, 10.8, 0.7),
            new THREE.Vector3(-0.5, 11.4, 0.7)
        ]);
        const hLine3 = new THREE.Line(hGeometry3, textMaterial);
        this.buildingParts.push({ mesh: hLine3, delay: 2.90, duration: 0.04 });

        // A
        const aGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.3, 10.8, 0.7),
            new THREE.Vector3(-0.05, 11.4, 0.7),
            new THREE.Vector3(0.2, 10.8, 0.7)
        ]);
        const aLine1 = new THREE.Line(aGeometry1, textMaterial);
        this.buildingParts.push({ mesh: aLine1, delay: 2.94, duration: 0.03 });

        const aGeometry2 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-0.2, 11.0, 0.7),
            new THREE.Vector3(0.1, 11.0, 0.7)
        ]);
        const aLine2 = new THREE.Line(aGeometry2, textMaterial);
        this.buildingParts.push({ mesh: aLine2, delay: 2.97, duration: 0.01 });

        // R
        const rGeometry1 = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0.4, 10.8, 0.7),
            new THREE.Vector3(0.4, 11.4, 0.7),
            new THREE.Vector3(0.9, 11.4, 0.7),
            new THREE.Vector3(0.9, 11.1, 0.7),
            new THREE.Vector3(0.4, 11.1, 0.7)
        ]);
        const rLine1 = new THREE.Line(rGeometry1, textMaterial);
        this.buildingParts.push({ mesh: rLine1, delay: 2.98, duration: 0.01 });

        // E
        const eGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(1.5, 10.8, 0.7),
            new THREE.Vector3(1.1, 10.8, 0.7),
            new THREE.Vector3(1.1, 11.4, 0.7),
            new THREE.Vector3(1.5, 11.4, 0.7)
        ]);
        const eLine = new THREE.Line(eGeometry, textMaterial);
        this.buildingParts.push({ mesh: eLine, delay: 2.99, duration: 0.01 });

        // Construction Crane
        this.addCrane();

        // Construction Workers
        this.addWorkers();

        // Growing Trees
        this.addTrees();

        // Pedestrians
        this.addPedestrians();

        // Celebration effects
        this.createCelebrationEffects();

        // Add all parts to scene (initially hidden)
        this.buildingParts.forEach(part => {
            part.mesh.visible = false;
            this.scene.add(part.mesh);
        });
    }

    addCrane() {
        const material = new THREE.LineBasicMaterial({ color: 0xffa500 }); // Orange crane
        const blackMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

        // Crane base
        const baseGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
        const baseEdges = new THREE.EdgesGeometry(baseGeometry);
        const base = new THREE.LineSegments(baseEdges, material);
        base.position.set(8, 0.25, -5);
        this.buildingParts.push({ mesh: base, delay: 0.2, duration: 0.2 });

        // Crane tower (vertical)
        const towerGeometry = new THREE.BoxGeometry(0.4, 12, 0.4);
        const towerEdges = new THREE.EdgesGeometry(towerGeometry);
        const tower = new THREE.LineSegments(towerEdges, material);
        tower.position.set(8, 6, -5);
        this.buildingParts.push({ mesh: tower, delay: 0.4, duration: 0.8 });

        // Crane arm (horizontal)
        const armGeometry = new THREE.BoxGeometry(10, 0.3, 0.3);
        const armEdges = new THREE.EdgesGeometry(armGeometry);
        const arm = new THREE.LineSegments(armEdges, material);
        arm.position.set(3, 12, -5);
        this.buildingParts.push({ mesh: arm, delay: 1.2, duration: 0.4 });

        // Crane hook cable
        const cableGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 12, -5),
            new THREE.Vector3(0, 8, -5)
        ]);
        const cable = new THREE.Line(cableGeometry, blackMaterial);
        this.buildingParts.push({ mesh: cable, delay: 1.6, duration: 0.2 });

        // Crane hook
        const hookGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
        const hookEdges = new THREE.EdgesGeometry(hookGeometry);
        const hook = new THREE.LineSegments(hookEdges, blackMaterial);
        hook.position.set(0, 7.75, -5);
        this.buildingParts.push({ mesh: hook, delay: 1.8, duration: 0.15 });

        // Counter weight
        const weightGeometry = new THREE.BoxGeometry(1.5, 1, 1);
        const weightEdges = new THREE.EdgesGeometry(weightGeometry);
        const weight = new THREE.LineSegments(weightEdges, material);
        weight.position.set(8, 12.5, -5);
        this.buildingParts.push({ mesh: weight, delay: 1.4, duration: 0.2 });
    }

    addWorkers() {
        const workerMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff }); // Blue for workers
        const helmetMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 }); // Yellow helmet

        // Worker 1 - ground level
        const worker1 = this.createWorker(3, 0.5, 2, workerMaterial, helmetMaterial);
        worker1.userData.workerIndex = 0;
        this.buildingParts.push({ mesh: worker1, delay: 0.5, duration: 0.3 });

        // Worker 2 - on first floor
        const worker2 = this.createWorker(-2, 2.5, 1, workerMaterial, helmetMaterial);
        worker2.userData.workerIndex = 1;
        this.buildingParts.push({ mesh: worker2, delay: 1.2, duration: 0.3 });

        // Worker 3 - on third floor
        const worker3 = this.createWorker(1, 6.5, 1.5, workerMaterial, helmetMaterial);
        worker3.userData.workerIndex = 2;
        this.buildingParts.push({ mesh: worker3, delay: 2.0, duration: 0.3 });

        // Worker 4 - near crane
        const worker4 = this.createWorker(6, 0.5, -4, workerMaterial, helmetMaterial);
        worker4.userData.workerIndex = 3;
        this.buildingParts.push({ mesh: worker4, delay: 0.8, duration: 0.3 });
    }

    createWorker(x, y, z, bodyMaterial, helmetMaterial) {
        const workerGroup = new THREE.Group();

        // Head with helmet
        const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const headEdges = new THREE.EdgesGeometry(headGeometry);
        const head = new THREE.LineSegments(headEdges, helmetMaterial);
        head.position.set(0, 0.6, 0);
        workerGroup.add(head);

        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);
        const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
        const body = new THREE.LineSegments(bodyEdges, bodyMaterial);
        body.position.set(0, 0.25, 0);
        workerGroup.add(body);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6);
        const legEdges = new THREE.EdgesGeometry(legGeometry);

        const leftLeg = new THREE.LineSegments(legEdges, bodyMaterial);
        leftLeg.position.set(-0.08, -0.2, 0);
        workerGroup.add(leftLeg);

        const rightLeg = new THREE.LineSegments(legEdges.clone(), bodyMaterial);
        rightLeg.position.set(0.08, -0.2, 0);
        workerGroup.add(rightLeg);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6);
        const armEdges = new THREE.EdgesGeometry(armGeometry);

        const leftArm = new THREE.LineSegments(armEdges, bodyMaterial);
        leftArm.position.set(-0.18, 0.25, 0);
        leftArm.rotation.z = Math.PI / 6;
        workerGroup.add(leftArm);

        const rightArm = new THREE.LineSegments(armEdges.clone(), bodyMaterial);
        rightArm.position.set(0.18, 0.25, 0);
        rightArm.rotation.z = -Math.PI / 6;
        workerGroup.add(rightArm);

        workerGroup.position.set(x, y, z);
        workerGroup.userData.baseY = y; // Store original Y position for jumping
        return workerGroup;
    }

    addTrees() {
        // Add 6 trees around the building
        const treePositions = [
            { x: -8, z: 6 },
            { x: 8, z: 6 },
            { x: -10, z: -2 },
            { x: 10, z: -2 },
            { x: -6, z: -8 },
            { x: 6, z: -8 }
        ];

        treePositions.forEach((pos, index) => {
            const tree = this.createTree(pos.x, 0, pos.z);
            tree.userData.isTree = true;
            // Trees grow at different times (1-2.5 seconds)
            this.buildingParts.push({
                mesh: tree,
                delay: 1.0 + index * 0.25,
                duration: 0.8,
                isGrowing: true
            });
        });
    }

    createTree(x, y, z) {
        const treeGroup = new THREE.Group();

        // Trunk - dark brown
        const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, 2, 8);
        const trunkMaterial = new THREE.LineBasicMaterial({ color: 0x4a3728 });
        const trunkEdges = new THREE.EdgesGeometry(trunkGeometry);
        const trunk = new THREE.LineSegments(trunkEdges, trunkMaterial);
        trunk.position.set(0, 1, 0);
        treeGroup.add(trunk);

        // Leaves - green spheres
        const leafMaterial = new THREE.LineBasicMaterial({ color: 0x2d5016 });

        for (let i = 0; i < 3; i++) {
            const leafGeometry = new THREE.SphereGeometry(0.8 - i * 0.15, 8, 8);
            const leafEdges = new THREE.EdgesGeometry(leafGeometry);
            const leaves = new THREE.LineSegments(leafEdges, leafMaterial);
            leaves.position.set(0, 2.2 + i * 0.5, 0);
            treeGroup.add(leaves);
        }

        treeGroup.position.set(x, y, z);
        treeGroup.scale.set(0, 0, 0); // Start from zero for growing animation
        return treeGroup;
    }

    addPedestrians() {
        // Add colorful pedestrians walking around
        const pedestrianData = [
            { x: -12, z: 8, color: 0xff6b6b, speed: 0.02, direction: 1 },   // Red
            { x: 12, z: 10, color: 0x4ecdc4, speed: 0.015, direction: -1 }, // Teal
            { x: -10, z: -10, color: 0xffe66d, speed: 0.018, direction: 1 }, // Yellow
            { x: 15, z: -8, color: 0x95e1d3, speed: 0.02, direction: -1 },  // Mint
            { x: -15, z: 5, color: 0xf38181, speed: 0.016, direction: 1 },  // Pink
            { x: 10, z: -12, color: 0xaa96da, speed: 0.019, direction: -1 } // Purple
        ];

        pedestrianData.forEach((data, index) => {
            const pedestrian = this.createPedestrian(data.x, 0.5, data.z, data.color);
            pedestrian.userData.isPedestrian = true;
            pedestrian.userData.speed = data.speed;
            pedestrian.userData.direction = data.direction;
            pedestrian.userData.startX = data.x;
            // Pedestrians appear at different times (1-2 seconds)
            this.buildingParts.push({
                mesh: pedestrian,
                delay: 1.0 + index * 0.15,
                duration: 0.3
            });
        });
    }

    createPedestrian(x, y, z, color) {
        const pedestrianGroup = new THREE.Group();

        // Head - black
        const headGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const headEdges = new THREE.EdgesGeometry(headGeometry);
        const headMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const head = new THREE.LineSegments(headEdges, headMaterial);
        head.position.set(0, 0.55, 0);
        pedestrianGroup.add(head);

        // Body - colorful
        const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.4, 8);
        const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
        const bodyMaterial = new THREE.LineBasicMaterial({ color: color });
        const body = new THREE.LineSegments(bodyEdges, bodyMaterial);
        body.position.set(0, 0.25, 0);
        pedestrianGroup.add(body);

        // Legs - darker version of body color
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 6);
        const legEdges = new THREE.EdgesGeometry(legGeometry);
        const legMaterial = new THREE.LineBasicMaterial({ color: Math.floor(color * 0.6) });

        const leftLeg = new THREE.LineSegments(legEdges, legMaterial);
        leftLeg.position.set(-0.06, -0.15, 0);
        pedestrianGroup.add(leftLeg);

        const rightLeg = new THREE.LineSegments(legEdges.clone(), legMaterial);
        rightLeg.position.set(0.06, -0.15, 0);
        pedestrianGroup.add(rightLeg);

        // Arms - same as body color
        const armGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
        const armEdges = new THREE.EdgesGeometry(armGeometry);

        const leftArm = new THREE.LineSegments(armEdges, bodyMaterial);
        leftArm.position.set(-0.15, 0.2, 0);
        leftArm.rotation.z = Math.PI / 8;
        pedestrianGroup.add(leftArm);

        const rightArm = new THREE.LineSegments(armEdges.clone(), bodyMaterial);
        rightArm.position.set(0.15, 0.2, 0);
        rightArm.rotation.z = -Math.PI / 8;
        pedestrianGroup.add(rightArm);

        pedestrianGroup.position.set(x, y, z);
        return pedestrianGroup;
    }

    createCelebrationEffects() {
        // Create confetti particles
        const confettiColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

        for (let i = 0; i < 100; i++) {
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            const confettiGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.02);
            const confettiMaterial = new THREE.MeshBasicMaterial({ color: color });
            const confettiMesh = new THREE.Mesh(confettiGeometry, confettiMaterial);

            // Random position above the building
            confettiMesh.position.set(
                (Math.random() - 0.5) * 15,
                12 + Math.random() * 3,
                (Math.random() - 0.5) * 10
            );

            // Random velocity
            confettiMesh.userData = {
                velocity: {
                    x: (Math.random() - 0.5) * 0.1,
                    y: -0.15 - Math.random() * 0.1,
                    z: (Math.random() - 0.5) * 0.1
                },
                rotation: {
                    x: Math.random() * 0.2,
                    y: Math.random() * 0.2,
                    z: Math.random() * 0.2
                }
            };

            this.confetti.push(confettiMesh);
            this.scene.add(confettiMesh);
        }

    }

    animate() {
        if (this.isComplete) return;

        requestAnimationFrame(() => this.animate());

        const elapsed = (Date.now() - this.startTime) / 1000; // in seconds
        const progress = Math.min(elapsed / (this.duration / 1000), 1);

        // Update progress text
        if (this.progressText) {
            this.progressText.textContent = Math.floor(progress * 100) + '%';
        }

        // Show building parts based on time
        this.buildingParts.forEach(part => {
            if (elapsed >= part.delay && elapsed <= part.delay + part.duration) {
                part.mesh.visible = true;

                // Special handling for growing trees
                if (part.isGrowing) {
                    const growProgress = (elapsed - part.delay) / part.duration;
                    // Trees grow from 0 to 1
                    part.mesh.scale.setScalar(growProgress);
                } else {
                    // Fade in effect for other parts
                    const fadeProgress = (elapsed - part.delay) / part.duration;
                    part.mesh.scale.setScalar(fadeProgress);
                }
            } else if (elapsed > part.delay + part.duration) {
                part.mesh.visible = true;
                part.mesh.scale.setScalar(1);
            }
        });

        // Animate pedestrians walking
        this.buildingParts.forEach(part => {
            if (part.mesh.userData.isPedestrian && part.mesh.visible) {
                const pedestrian = part.mesh;
                const speed = pedestrian.userData.speed;
                const direction = pedestrian.userData.direction;

                // Walk back and forth
                pedestrian.position.x += speed * direction;

                // Turn around at boundaries
                if (Math.abs(pedestrian.position.x) > 18) {
                    pedestrian.userData.direction *= -1;
                    pedestrian.rotation.y = pedestrian.userData.direction > 0 ? 0 : Math.PI;
                }

                // Animate legs for walking effect
                const walkCycle = Math.sin(elapsed * 10);
                if (pedestrian.children[2]) { // left leg
                    pedestrian.children[2].rotation.x = walkCycle * 0.3;
                }
                if (pedestrian.children[3]) { // right leg
                    pedestrian.children[3].rotation.x = -walkCycle * 0.3;
                }
            }
        });

        // Start celebration at 3 seconds
        if (elapsed >= 3.0 && !this.celebrationStarted) {
            this.celebrationStarted = true;
        }

        // Animate confetti and workers celebrating
        if (this.celebrationStarted) {
            this.confetti.forEach(particle => {
                particle.position.x += particle.userData.velocity.x;
                particle.position.y += particle.userData.velocity.y;
                particle.position.z += particle.userData.velocity.z;

                particle.rotation.x += particle.userData.rotation.x;
                particle.rotation.y += particle.userData.rotation.y;
                particle.rotation.z += particle.userData.rotation.z;

                // Remove confetti that fell below ground
                if (particle.position.y < -1) {
                    particle.position.y = 15;
                }
            });

            // Make workers wave their arms
            this.buildingParts.forEach(part => {
                if (part.mesh.userData.workerIndex !== undefined && part.mesh.visible) {
                    const worker = part.mesh;
                    const waveSpeed = 8 + part.mesh.userData.workerIndex;
                    const waveAngle = Math.sin(elapsed * waveSpeed) * 0.5;

                    // Right arm waves
                    if (worker.children[5]) {
                        worker.children[5].rotation.z = -Math.PI / 6 + waveAngle;
                    }

                    // Jump animation
                    const jumpHeight = Math.abs(Math.sin(elapsed * 6 + part.mesh.userData.workerIndex)) * 0.3;
                    worker.position.y = worker.userData.baseY ? worker.userData.baseY + jumpHeight : worker.position.y;
                }
            });
        }

        // Camera movement
        if (elapsed < 3.0) {
            // Slowly rotate camera to show building and crane
            const angle = elapsed * 0.15;
            const radius = 20;
            this.camera.position.x = Math.cos(angle) * radius;
            this.camera.position.z = Math.sin(angle) * radius;
            this.camera.position.y = 12;
            this.camera.lookAt(0, 6, 0);
        } else if (elapsed < 4.0) {
            // Move to front position (3-4 seconds)
            const moveProgress = (elapsed - 3.0) / 1.0;

            // Start position at 3 seconds
            const angle3 = 3.0 * 0.15;
            const startX = Math.cos(angle3) * 20;
            const startZ = Math.sin(angle3) * 20;
            const startY = 12;

            // Target: front of building
            const targetX = 0;
            const targetZ = 25;
            const targetY = 3;

            // Smooth transition
            const smoothProgress = moveProgress * moveProgress * (3 - 2 * moveProgress); // smoothstep

            this.camera.position.x = startX + (targetX - startX) * smoothProgress;
            this.camera.position.y = startY + (targetY - startY) * smoothProgress;
            this.camera.position.z = startZ + (targetZ - startZ) * smoothProgress;

            this.camera.lookAt(0, 6, 0);
        } else {
            // Enter the building from front (4-5 seconds)
            const entranceProgress = (elapsed - 4.0) / 1.0;

            // Start: front of building
            const startX = 0;
            const startY = 3;
            const startZ = 25;

            // Target: inside the entrance
            const targetX = 0;
            const targetY = 1.75;
            const targetZ = 1.0; // Inside the door

            // Ease-in-out effect for smooth acceleration
            const easeProgress = entranceProgress < 0.5
                ? 2 * entranceProgress * entranceProgress
                : 1 - Math.pow(-2 * entranceProgress + 2, 2) / 2;

            this.camera.position.x = startX + (targetX - startX) * easeProgress;
            this.camera.position.y = startY + (targetY - startY) * easeProgress;
            this.camera.position.z = startZ + (targetZ - startZ) * easeProgress;

            // Look straight into the door
            this.camera.lookAt(0, 1.75, 0);
        }

        this.renderer.render(this.scene, this.camera);

        // Complete loading after duration
        if (progress >= 1 && !this.isComplete) {
            this.isComplete = true;
            // Start fade out immediately
            this.completeLoading();
        }
    }

    completeLoading() {
        if (this.loadingScreen) {
            // Fade out the entire loading screen
            this.loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 2000);
        }
    }

    onResize() {
        if (!this.camera || !this.renderer) return;

        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Initialize loading animation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LoadingAnimation();
});
