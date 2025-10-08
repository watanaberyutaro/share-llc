// 3D Hero Background - Person with Smartphone and Signal Waves
// Wireframe person holding phone with radio wave animation

class Hero3DPhoneSignal {
    constructor(canvasId) {
        console.log('Constructor called with canvasId:', canvasId);
        this.canvas = document.getElementById(canvasId);
        console.log('Canvas element:', this.canvas);

        if (!this.canvas) {
            console.error('Canvas not found in constructor!');
            return;
        }

        console.log('THREE defined?', typeof THREE);

        this.clock = null;
        this.signalWaves = [];
        this.waveTimer = 0;
        this.waveInterval = 1.0; // Create new wave every 1.0 seconds

        // Multiple people
        this.people = [];

        // Define 8 different colors for different people
        this.personColors = [
            0xff6b6b, // Red
            0x4ecdc4, // Teal
            0xffe66d, // Yellow
            0x95e1d3, // Mint
            0xf38181, // Pink
            0xaa96da, // Purple
            0x6bcf7f, // Green
            0xffa07a  // Orange
        ];
        this.colorIndex = 0;

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
        this.camera.position.set(0, 1.5, 6);
        this.camera.lookAt(0, 1, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

        // Create ground
        this.createGround();

        // Create building in center
        this.createBuilding();

        // Create multiple people with phones at different starting positions
        this.createPerson(-4, 0, -3); // Far left back
        this.createPerson(4, 0, -3); // Far right back
        this.createPerson(-5, 0, 1); // Far left front
        this.createPerson(5, 0, 1); // Far right front
        this.createPerson(-2, 0, 4); // Left very front

        // Create background particles
        this.createParticles();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation
        this.animate();

        console.log('Three.js scene initialized successfully');
    }

    createGround() {
        // Create wireframe grid ground
        const gridSize = 20;
        const gridDivisions = 20;

        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x000000);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);

        // Create wireframe plane
        const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
        const planeEdges = new THREE.EdgesGeometry(planeGeometry);
        const planeMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.2
        });
        const plane = new THREE.LineSegments(planeEdges, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.05;
        this.scene.add(plane);
    }

    createBuilding() {
        const building = new THREE.Group();
        const buildingMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8
        });

        // Main building body - taller office building (4x6x4)
        const bodyGeometry = new THREE.BoxGeometry(4, 6, 4);
        const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
        const body = new THREE.LineSegments(bodyEdges, buildingMaterial);
        body.position.y = 3; // Lift up so bottom is at y=0
        building.add(body);

        // Entrance area (protruding entrance)
        const entranceGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.5);
        const entranceEdges = new THREE.EdgesGeometry(entranceGeometry);
        const entrance = new THREE.LineSegments(entranceEdges, buildingMaterial);
        entrance.position.set(0, 1.25, 2.25);
        building.add(entrance);

        // Door frame
        const doorGeometry = new THREE.PlaneGeometry(1.0, 2.0);
        const doorEdges = new THREE.EdgesGeometry(doorGeometry);
        const door = new THREE.LineSegments(doorEdges, buildingMaterial);
        door.position.set(0, 1.0, 2.51);
        building.add(door);

        // Door handle
        const handleGeometry = new THREE.CircleGeometry(0.05, 8);
        const handleEdges = new THREE.EdgesGeometry(handleGeometry);
        const handle = new THREE.LineSegments(handleEdges, buildingMaterial);
        handle.position.set(0.35, 1.0, 2.52);
        building.add(handle);

        // Windows - multiple floors
        for (let floor = 0; floor < 3; floor++) {
            // Front windows
            for (let i = 0; i < 3; i++) {
                const windowGeometry = new THREE.PlaneGeometry(0.6, 0.8);
                const windowEdges = new THREE.EdgesGeometry(windowGeometry);
                const window = new THREE.LineSegments(windowEdges, buildingMaterial);
                window.position.set(-1.2 + i * 1.2, 3 + floor * 1.5, 2.01);
                building.add(window);
            }

            // Side windows - left
            for (let i = 0; i < 2; i++) {
                const windowGeometry = new THREE.PlaneGeometry(0.6, 0.8);
                const windowEdges = new THREE.EdgesGeometry(windowGeometry);
                const window = new THREE.LineSegments(windowEdges, buildingMaterial);
                window.position.set(-2.01, 3 + floor * 1.5, -0.8 + i * 1.6);
                window.rotation.y = Math.PI / 2;
                building.add(window);
            }

            // Side windows - right
            for (let i = 0; i < 2; i++) {
                const windowGeometry = new THREE.PlaneGeometry(0.6, 0.8);
                const windowEdges = new THREE.EdgesGeometry(windowGeometry);
                const window = new THREE.LineSegments(windowEdges, buildingMaterial);
                window.position.set(2.01, 3 + floor * 1.5, -0.8 + i * 1.6);
                window.rotation.y = Math.PI / 2;
                building.add(window);
            }
        }

        // Rooftop edge
        const roofEdgeGeometry = new THREE.BoxGeometry(4.2, 0.3, 4.2);
        const roofEdgeEdges = new THREE.EdgesGeometry(roofEdgeGeometry);
        const roofEdge = new THREE.LineSegments(roofEdgeEdges, buildingMaterial);
        roofEdge.position.y = 6.15;
        building.add(roofEdge);

        // SHARE sign - white text on black background
        // Sign background - solid black
        const signBgGeometry = new THREE.PlaneGeometry(2.5, 0.6);
        const signBgMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide
        });
        const signBg = new THREE.Mesh(signBgGeometry, signBgMaterial);
        signBg.position.set(0, 5.5, 2.02);
        building.add(signBg);

        // Sign border
        const signBorderEdges = new THREE.EdgesGeometry(signBgGeometry);
        const signBorderMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2
        });
        const signBorder = new THREE.LineSegments(signBorderEdges, signBorderMaterial);
        signBorder.position.set(0, 5.5, 2.03);
        building.add(signBorder);

        // Create "SHARE" text using white lines
        const textMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2
        });

        // S
        const sPoints = [
            new THREE.Vector3(-1.0, 5.7, 2.03),
            new THREE.Vector3(-0.7, 5.7, 2.03),
            new THREE.Vector3(-0.7, 5.5, 2.03),
            new THREE.Vector3(-1.0, 5.5, 2.03),
            new THREE.Vector3(-1.0, 5.3, 2.03),
            new THREE.Vector3(-0.7, 5.3, 2.03)
        ];
        const sGeometry = new THREE.BufferGeometry().setFromPoints(sPoints);
        const s = new THREE.Line(sGeometry, textMaterial);
        building.add(s);

        // H
        const hPoints = [
            new THREE.Vector3(-0.5, 5.7, 2.03),
            new THREE.Vector3(-0.5, 5.3, 2.03),
            new THREE.Vector3(-0.5, 5.5, 2.03),
            new THREE.Vector3(-0.2, 5.5, 2.03),
            new THREE.Vector3(-0.2, 5.7, 2.03),
            new THREE.Vector3(-0.2, 5.3, 2.03)
        ];
        const hGeometry = new THREE.BufferGeometry().setFromPoints(hPoints);
        const h = new THREE.Line(hGeometry, textMaterial);
        building.add(h);

        // A
        const aPoints = [
            new THREE.Vector3(0.0, 5.3, 2.03),
            new THREE.Vector3(0.15, 5.7, 2.03),
            new THREE.Vector3(0.3, 5.3, 2.03),
            new THREE.Vector3(0.3, 5.5, 2.03),
            new THREE.Vector3(0.0, 5.5, 2.03)
        ];
        const aGeometry = new THREE.BufferGeometry().setFromPoints(aPoints);
        const a = new THREE.Line(aGeometry, textMaterial);
        building.add(a);

        // R
        const rPoints = [
            new THREE.Vector3(0.4, 5.3, 2.03),
            new THREE.Vector3(0.4, 5.7, 2.03),
            new THREE.Vector3(0.7, 5.7, 2.03),
            new THREE.Vector3(0.7, 5.5, 2.03),
            new THREE.Vector3(0.4, 5.5, 2.03),
            new THREE.Vector3(0.7, 5.3, 2.03)
        ];
        const rGeometry = new THREE.BufferGeometry().setFromPoints(rPoints);
        const r = new THREE.Line(rGeometry, textMaterial);
        building.add(r);

        // E
        const ePoints = [
            new THREE.Vector3(1.0, 5.3, 2.03),
            new THREE.Vector3(0.8, 5.3, 2.03),
            new THREE.Vector3(0.8, 5.7, 2.03),
            new THREE.Vector3(1.0, 5.7, 2.03),
            new THREE.Vector3(0.8, 5.5, 2.03),
            new THREE.Vector3(1.0, 5.5, 2.03)
        ];
        const eGeometry = new THREE.BufferGeometry().setFromPoints(ePoints);
        const e = new THREE.Line(eGeometry, textMaterial);
        building.add(e);

        this.building = building;
        this.buildingPosition = new THREE.Vector3(0, 0, 0);
        this.entrancePosition = new THREE.Vector3(0, 0, 2.5); // Door position
        this.entranceRadius = 0.8; // Distance from door to be considered "at entrance"

        this.scene.add(building);
    }

    createPerson(posX = 0, posY = 0, posZ = 0) {
        const personGroup = new THREE.Group();
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.8
        });

        // Assign unique color to each person
        const assignedColor = this.personColors[this.colorIndex % this.personColors.length];
        this.colorIndex++;

        const colorfulMaterial = new THREE.LineBasicMaterial({
            color: assignedColor,
            transparent: true,
            opacity: 0.9
        });

        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headEdges = new THREE.EdgesGeometry(headGeometry);
        const head = new THREE.LineSegments(headEdges, wireframeMaterial);
        head.position.y = 1.5;
        personGroup.add(head);

        // Body (torso) - colorful outfit
        const torsoGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.3);
        const torsoEdges = new THREE.EdgesGeometry(torsoGeometry);
        const torso = new THREE.LineSegments(torsoEdges, colorfulMaterial);
        torso.position.y = 0.9;
        personGroup.add(torso);

        // Left arm (slightly bent) - colorful
        const leftUpperArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
        const leftUpperArmEdges = new THREE.EdgesGeometry(leftUpperArmGeometry);
        const leftUpperArm = new THREE.LineSegments(leftUpperArmEdges, colorfulMaterial);
        leftUpperArm.position.set(-0.35, 1.0, 0);
        leftUpperArm.rotation.z = 0.3;
        personGroup.add(leftUpperArm);

        const leftLowerArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
        const leftLowerArmEdges = new THREE.EdgesGeometry(leftLowerArmGeometry);
        const leftLowerArm = new THREE.LineSegments(leftLowerArmEdges, colorfulMaterial);
        leftLowerArm.position.set(-0.5, 0.7, 0);
        leftLowerArm.rotation.z = -0.2;
        personGroup.add(leftLowerArm);

        // Right arm (holding phone) - Create as a group for easier animation, colorful
        const rightArmGroup = new THREE.Group();

        const rightUpperArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
        const rightUpperArmEdges = new THREE.EdgesGeometry(rightUpperArmGeometry);
        const rightUpperArm = new THREE.LineSegments(rightUpperArmEdges, colorfulMaterial);
        rightUpperArm.position.set(0, -0.2, 0);
        rightArmGroup.add(rightUpperArm);

        const rightLowerArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 6);
        const rightLowerArmEdges = new THREE.EdgesGeometry(rightLowerArmGeometry);
        const rightLowerArm = new THREE.LineSegments(rightLowerArmEdges, colorfulMaterial);
        rightLowerArm.position.set(0.2, -0.55, 0.15);
        rightLowerArm.rotation.z = 0.5;
        rightLowerArm.rotation.x = -0.3;
        rightArmGroup.add(rightLowerArm);

        // Smartphone in hand
        const phoneGeometry = new THREE.BoxGeometry(0.15, 0.25, 0.02);
        const phoneEdges = new THREE.EdgesGeometry(phoneGeometry);
        const phoneMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 1.0
        });
        const phone = new THREE.LineSegments(phoneEdges, phoneMaterial);
        phone.position.set(0.3, -0.7, 0.25);
        phone.rotation.x = -0.3;
        phone.rotation.y = -0.2;
        rightArmGroup.add(phone);

        rightArmGroup.position.set(0.35, 1.2, 0);
        personGroup.add(rightArmGroup);

        // Legs
        const leftLegGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
        const leftLegEdges = new THREE.EdgesGeometry(leftLegGeometry);
        const leftLeg = new THREE.LineSegments(leftLegEdges, wireframeMaterial);
        leftLeg.position.set(-0.15, 0.15, 0);
        personGroup.add(leftLeg);

        const rightLegGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
        const rightLegEdges = new THREE.EdgesGeometry(rightLegGeometry);
        const rightLeg = new THREE.LineSegments(rightLegEdges, wireframeMaterial);
        rightLeg.position.set(0.15, 0.15, 0);
        personGroup.add(rightLeg);

        // Set position
        personGroup.position.set(posX, posY, posZ);

        // Store legs for walking animation
        const legs = { leftLeg, rightLeg };

        // Store all visible body parts for opacity control
        const bodyParts = [head, torso, leftUpperArm, leftLowerArm, leftLeg, rightLeg];

        // Store person data with random animation offset and walking parameters
        const personData = {
            group: personGroup,
            rightArmGroup: rightArmGroup,
            phone: phone,
            head: head,
            legs: legs,
            bodyParts: bodyParts,
            phonePosition: new THREE.Vector3(),
            animationState: 'phone',
            stateTimer: Math.random() * 3.0, // Random offset for phone/looking state
            stateDuration: 2.5 + Math.random() * 2.0, // Random duration 2.5-4.5 seconds
            // Walking parameters
            walkSpeed: 0.4 + Math.random() * 0.4, // Random speed 0.4-0.8
            walkDirection: Math.random() * Math.PI * 2, // Random initial direction
            walkTimer: Math.random() * 5.0, // Random offset for direction change
            walkChangeInterval: 4.0 + Math.random() * 4.0, // Change direction every 4-8 seconds
            walkBoundary: 8.0, // Maximum distance from center (stay within visible area)
            // Building interaction
            buildingState: 'outside', // 'outside', 'entering', 'inside', 'exiting'
            buildingTimer: Math.random() * 10.0, // Random offset
            buildingInterval: 8.0 + Math.random() * 8.0, // Enter building every 8-16 seconds
            insideDuration: 3.0 + Math.random() * 3.0 // Stay inside 3-6 seconds
        };

        this.people.push(personData);
        this.scene.add(personGroup);
    }

    createSignalWave(phonePosition) {
        // Create expanding wireframe circle representing radio wave
        const segments = 24;
        const radius = 0.2;

        // Create multiple concentric circles for wave effect
        const waveGroup = new THREE.Group();

        // Create 2 concentric circles (reduced from 3)
        for (let i = 0; i < 2; i++) {
            const circleRadius = radius + (i * 0.08);
            const points = [];

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * circleRadius,
                    Math.sin(angle) * circleRadius,
                    0
                ));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.5 // Reduced from 0.8
            });

            const circle = new THREE.Line(geometry, material);
            waveGroup.add(circle);
        }

        waveGroup.position.copy(phonePosition);
        waveGroup.rotation.x = -0.3;
        waveGroup.rotation.y = -0.2;

        waveGroup.userData = {
            age: 0,
            maxAge: 1.8, // Reduced from 2.5
            startScale: 1,
            endScale: 4 // Reduced from 10
        };

        this.signalWaves.push(waveGroup);
        this.scene.add(waveGroup);
    }

    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 100;
        const positions = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 15;
            positions[i + 1] = Math.random() * 10 - 2;
            positions[i + 2] = (Math.random() - 0.5) * 15;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x000000,
            size: 0.02,
            transparent: true,
            opacity: 0.3
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.clock) return;

        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        this.update(deltaTime, elapsedTime);
    }

    update(deltaTime, time) {
        // Update all people
        this.people.forEach(person => {
            // Update animation state
            person.stateTimer += deltaTime;
            if (person.stateTimer >= person.stateDuration) {
                person.stateTimer = 0;
                // Switch between states
                if (person.animationState === 'phone') {
                    person.animationState = 'looking';
                } else {
                    person.animationState = 'phone';
                }
            }

            // Animate arm based on state
            const transitionProgress = Math.min(person.stateTimer / 0.8, 1.0); // 0.8 second transition
            const easeProgress = transitionProgress < 0.5
                ? 2 * transitionProgress * transitionProgress
                : 1 - Math.pow(-2 * transitionProgress + 2, 2) / 2;

            if (person.animationState === 'phone') {
                // Phone to ear (calling) - bring phone to head position
                const targetRotationZ = -1.5;
                const targetRotationX = 0.5;
                const targetY = 1.5;
                const targetZ = -0.1;

                person.rightArmGroup.rotation.z = targetRotationZ * easeProgress;
                person.rightArmGroup.rotation.x = targetRotationX * easeProgress;
                person.rightArmGroup.position.y = 1.2 + (targetY - 1.2) * easeProgress;
                person.rightArmGroup.position.z = targetZ * easeProgress;

                // Adjust phone position to be at ear
                const phoneTargetY = -0.25;
                const phoneTargetZ = -0.1;
                person.phone.position.y = -0.7 + (phoneTargetY - (-0.7)) * easeProgress;
                person.phone.position.z = 0.25 + (phoneTargetZ - 0.25) * easeProgress;

                // Tilt head slightly when calling
                person.head.rotation.x = 0;
                person.head.rotation.z = 0.15 * easeProgress;
            } else {
                // Phone in front (looking at screen)
                const targetRotationZ = -0.3;
                const targetRotationX = -0.4;
                const targetY = 1.1;

                person.rightArmGroup.rotation.z = targetRotationZ * easeProgress;
                person.rightArmGroup.rotation.x = targetRotationX * easeProgress;
                person.rightArmGroup.position.y = 1.2 + (targetY - 1.2) * easeProgress;
                person.rightArmGroup.position.z = 0;

                // Reset phone position
                person.phone.position.y = -0.7;
                person.phone.position.z = 0.25;

                // Head looks down when looking at phone
                person.head.rotation.x = -0.3 * easeProgress;
                person.head.rotation.z = 0;
            }

            // Update phone position for signal waves
            person.phone.getWorldPosition(person.phonePosition);

            // Building interaction logic
            person.buildingTimer += deltaTime;

            // Calculate distance to entrance door
            const distToEntrance = Math.sqrt(
                (person.group.position.x - this.entrancePosition.x) * (person.group.position.x - this.entrancePosition.x) +
                (person.group.position.z - this.entrancePosition.z) * (person.group.position.z - this.entrancePosition.z)
            );

            // State machine for building interaction
            if (person.buildingState === 'outside') {
                // Normal walking behavior
                person.walkTimer += deltaTime;
                if (person.walkTimer >= person.walkChangeInterval) {
                    person.walkTimer = 0;
                    person.walkDirection = Math.random() * Math.PI * 2;
                }

                // Check if it's time to enter building
                if (person.buildingTimer >= person.buildingInterval) {
                    person.buildingState = 'entering';
                    person.buildingTimer = 0;
                }

                // Move person
                const moveX = Math.cos(person.walkDirection) * person.walkSpeed * deltaTime;
                const moveZ = Math.sin(person.walkDirection) * person.walkSpeed * deltaTime;
                const newX = person.group.position.x + moveX;
                const newZ = person.group.position.z + moveZ;

                const distanceFromCenter = Math.sqrt(newX * newX + newZ * newZ);

                if (distanceFromCenter < person.walkBoundary) {
                    person.group.position.x = newX;
                    person.group.position.z = newZ;
                } else {
                    const angleToCenter = Math.atan2(-newZ, -newX);
                    person.walkDirection = angleToCenter + (Math.random() - 0.5) * Math.PI * 0.5;
                }

            } else if (person.buildingState === 'entering') {
                // Walk towards entrance door
                const angleToEntrance = Math.atan2(
                    this.entrancePosition.z - person.group.position.z,
                    this.entrancePosition.x - person.group.position.x
                );
                person.walkDirection = angleToEntrance;

                const moveX = Math.cos(person.walkDirection) * person.walkSpeed * deltaTime;
                const moveZ = Math.sin(person.walkDirection) * person.walkSpeed * deltaTime;
                person.group.position.x += moveX;
                person.group.position.z += moveZ;

                // Check if reached entrance
                if (distToEntrance < this.entranceRadius) {
                    person.buildingState = 'inside';
                    person.buildingTimer = 0;
                }

                // Fade out as approaching entrance
                const fadeDistance = 2.0; // Start fading 2 units away
                const fadeProgress = Math.max(0, 1 - (distToEntrance / fadeDistance));
                const targetOpacity = 0.9 * (1 - fadeProgress);
                person.bodyParts.forEach(part => {
                    if (part.material) {
                        part.material.opacity = targetOpacity;
                    }
                });
                // Also fade out right arm group parts
                person.rightArmGroup.children.forEach(part => {
                    if (part.material) {
                        part.material.opacity = targetOpacity;
                    }
                });

            } else if (person.buildingState === 'inside') {
                // Stay invisible inside building
                person.bodyParts.forEach(part => {
                    if (part.material) {
                        part.material.opacity = 0;
                    }
                });
                person.rightArmGroup.children.forEach(part => {
                    if (part.material) {
                        part.material.opacity = 0;
                    }
                });

                // Check if time to exit
                if (person.buildingTimer >= person.insideDuration) {
                    person.buildingState = 'exiting';
                    person.buildingTimer = 0;
                    // Position person at entrance when exiting
                    person.group.position.x = this.entrancePosition.x;
                    person.group.position.z = this.entrancePosition.z;
                    // Random exit direction (away from building)
                    person.walkDirection = Math.random() * Math.PI - Math.PI / 2; // -90 to 90 degrees (away from building)
                }

            } else if (person.buildingState === 'exiting') {
                // Walk away from entrance
                const moveX = Math.cos(person.walkDirection) * person.walkSpeed * deltaTime;
                const moveZ = Math.sin(person.walkDirection) * person.walkSpeed * deltaTime;
                person.group.position.x += moveX;
                person.group.position.z += moveZ;

                // Fade in as leaving entrance
                const fadeDistance = 2.0;
                const fadeProgress = Math.min(1, distToEntrance / fadeDistance);
                const targetOpacity = 0.9 * fadeProgress;
                person.bodyParts.forEach(part => {
                    if (part.material) {
                        part.material.opacity = targetOpacity;
                    }
                });
                person.rightArmGroup.children.forEach(part => {
                    if (part.material) {
                        part.material.opacity = targetOpacity;
                    }
                });

                // Check if fully outside
                if (distToEntrance > fadeDistance) {
                    person.buildingState = 'outside';
                    person.buildingTimer = 0;
                    person.buildingInterval = 8.0 + Math.random() * 8.0; // Next visit time
                }
            }

            // Leg walking animation
            const walkCycle = Math.sin(time * 5 + person.stateTimer * 3);
            person.legs.leftLeg.rotation.x = walkCycle * 0.3;
            person.legs.rightLeg.rotation.x = -walkCycle * 0.3;

            // Slight body rotation when walking
            person.group.rotation.y = Math.sin(time * 0.5 + person.stateTimer) * 0.1;

            // Subtle breathing animation
            const breathScale = 1.0 + Math.sin(time * 2) * 0.02;
            person.group.scale.y = breathScale;
        });

        // Create new signal waves periodically from all people (only if outside)
        this.waveTimer += deltaTime;
        if (this.waveTimer >= this.waveInterval) {
            this.people.forEach(person => {
                // Only create waves if person is outside (visible)
                if (person.buildingState === 'outside' || person.buildingState === 'exiting') {
                    this.createSignalWave(person.phonePosition);
                }
            });
            this.waveTimer = 0;
        }

        // Update existing signal waves
        for (let i = this.signalWaves.length - 1; i >= 0; i--) {
            const wave = this.signalWaves[i];
            wave.userData.age += deltaTime;

            const progress = wave.userData.age / wave.userData.maxAge;

            if (progress >= 1.0) {
                // Remove old wave
                this.scene.remove(wave);
                this.signalWaves.splice(i, 1);
            } else {
                // Scale up and fade out
                const scale = wave.userData.startScale + (wave.userData.endScale - wave.userData.startScale) * progress;
                wave.scale.set(scale, scale, scale);

                // Update opacity for all circles in the wave group - faster fade
                const opacity = 0.5 * (1.0 - progress) * (1.0 - progress);
                wave.children.forEach(circle => {
                    circle.material.opacity = opacity;
                });
            }
        }

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y = time * 0.05;
        }

        // Camera orbit around the scene - higher and further to see building
        const cameraRadius = 10;
        const cameraSpeed = 0.08;
        const cameraAngle = time * cameraSpeed;

        this.camera.position.x = Math.sin(cameraAngle) * cameraRadius;
        this.camera.position.z = Math.cos(cameraAngle) * cameraRadius;
        this.camera.position.y = 4;

        this.camera.lookAt(0, 2, 0);

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
        console.log('Creating Hero3DPhoneSignal instance');
        new Hero3DPhoneSignal('hero-3d-canvas');
    } else {
        console.error('Canvas element #hero-3d-canvas not found!');
    }
});
