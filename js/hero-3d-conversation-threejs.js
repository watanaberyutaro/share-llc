// 3D Hero Background - People in Conversation using Three.js
// More realistic wireframe people with alternating speech bubbles

class Hero3DConversationThree {
    constructor(canvasId) {
        console.log('Constructor called with canvasId:', canvasId);
        this.canvas = document.getElementById(canvasId);
        console.log('Canvas element:', this.canvas);

        if (!this.canvas) {
            console.error('Canvas not found in constructor!');
            return;
        }

        // Check if THREE is already defined
        console.log('THREE defined?', typeof THREE);

        this.clock = null; // Will be initialized after THREE loads
        this.speechBubbles = [];
        this.currentSpeaker = 0;
        this.speechTimer = 0;
        this.speechDuration = 2.0; // Duration each person speaks

        this.loadThreeJS();
    }

    loadThreeJS() {
        console.log('loadThreeJS called, THREE is:', typeof THREE);
        if (typeof THREE !== 'undefined') {
            this.clock = new THREE.Clock();
            this.init();
        } else {
            const script = document.createElement('script');
            // Try unpkg CDN instead
            script.src = 'https://unpkg.com/three@0.128.0/build/three.min.js';
            script.onload = () => {
                console.log('Three.js loaded successfully from unpkg');
                this.clock = new THREE.Clock();
                this.init();
            };
            script.onerror = () => {
                console.error('Failed to load Three.js from unpkg, trying jsdelivr...');
                // Try another CDN
                const script2 = document.createElement('script');
                script2.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
                script2.onload = () => {
                    console.log('Three.js loaded from jsdelivr');
                    this.clock = new THREE.Clock();
                    this.init();
                };
                script2.onerror = () => {
                    console.error('All CDNs failed, using fallback');
                    this.fallbackToCanvas();
                };
                document.head.appendChild(script2);
            };
            document.head.appendChild(script);
        }
    }

    fallbackToCanvas() {
        // Fallback to simple canvas animation if Three.js fails
        console.log('Using fallback canvas animation');
        const ctx = this.canvas.getContext('2d');

        const animate = () => {
            ctx.fillStyle = '#252525';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;

            const time = Date.now() * 0.001;

            // Draw simple wireframe figures
            ctx.beginPath();
            ctx.arc(this.canvas.width * 0.3, this.canvas.height * 0.4, 20, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(this.canvas.width * 0.7, this.canvas.height * 0.4, 20, 0, Math.PI * 2);
            ctx.stroke();

            requestAnimationFrame(animate);
        };

        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        animate();
    }

    init() {
        console.log('Initializing Three.js scene');

        // Ensure canvas has dimensions
        if (this.canvas.offsetWidth === 0 || this.canvas.offsetHeight === 0) {
            console.error('Canvas has no dimensions');
            return;
        }

        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.canvas.offsetWidth / this.canvas.offsetHeight,
            0.1,
            1000
        );
        // Initial camera position looking at the two people
        this.camera.position.set(4.5, 1.5, 5);
        this.camera.lookAt(4.5, 0.5, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0xffffff, 1); // White background

        console.log('Canvas size:', this.canvas.offsetWidth, 'x', this.canvas.offsetHeight);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        // Create people - position them on the right side, facing each other
        // Person 1 with blue shirt, Person 2 with orange shirt
        this.person1 = this.createPerson(3.5, -0.5, 0, 0x2563eb); // Darker blue
        this.person2 = this.createPerson(5.5, -0.5, 0, 0xea580c); // Darker orange

        // Rotate them to face each other directly
        this.person1.rotation.y = Math.PI / 4; // Face toward right
        this.person2.rotation.y = -Math.PI / 4 - Math.PI; // Face toward left

        this.scene.add(this.person1);
        this.scene.add(this.person2);

        // Create speech bubbles - start with person 1 speaking
        this.bubble1 = this.createSpeechBubble('left'); // Arrow points to left person
        this.bubble1.position.set(3.5, 2.0, 0);
        this.bubble1.visible = true; // Start visible
        this.bubble1.userData = {
            baseY: 2.0,
            baseX: 3.5,
            opacity: 1.0,
            isActive: true,
            targetOpacity: 1.0
        };
        this.scene.add(this.bubble1);

        this.bubble2 = this.createSpeechBubble('right'); // Arrow points to right person
        this.bubble2.position.set(5.5, 2.0, 0);
        this.bubble2.visible = false; // Start hidden
        this.bubble2.userData = {
            baseY: 2.0,
            baseX: 5.5,
            opacity: 0.0,
            isActive: false,
            targetOpacity: 0.0
        };
        this.scene.add(this.bubble2);

        // Create floating particles
        this.createParticles();

        // Create ground (street)
        this.createGround();

        // Create tree
        this.createTree(1.5, -0.8, -2);

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation
        this.animate();
    }

    createPerson(x, y, z, shirtColor) {
        const person = new THREE.Group();
        const material = new THREE.LineBasicMaterial({
            color: 0x000000, // Black
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });

        // Colored material for shirt
        const shirtMaterial = new THREE.LineBasicMaterial({
            color: shirtColor || 0x000000,
            transparent: true,
            opacity: 0.9,
            linewidth: 2
        });

        // Head (wireframe sphere)
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headEdges = new THREE.EdgesGeometry(headGeometry);
        const head = new THREE.LineSegments(headEdges, material);
        head.position.y = 1.6;
        person.add(head);

        // Neck
        const neckPoints = [
            new THREE.Vector3(0, 1.35, 0),
            new THREE.Vector3(0, 1.2, 0)
        ];
        const neckGeometry = new THREE.BufferGeometry().setFromPoints(neckPoints);
        const neck = new THREE.Line(neckGeometry, material);
        person.add(neck);

        // Torso/Shirt (wireframe box to represent clothing) - with color
        const torsoGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.3);
        const torsoEdges = new THREE.EdgesGeometry(torsoGeometry);
        const torso = new THREE.LineSegments(torsoEdges, shirtMaterial);
        torso.position.y = 0.85;
        person.add(torso);
        person.userData.torso = torso;

        // Waist line (belt area)
        const waistPoints = [
            new THREE.Vector3(-0.25, 0.5, 0.15),
            new THREE.Vector3(0.25, 0.5, 0.15),
            new THREE.Vector3(0.25, 0.5, -0.15),
            new THREE.Vector3(-0.25, 0.5, -0.15),
            new THREE.Vector3(-0.25, 0.5, 0.15)
        ];
        const waistGeometry = new THREE.BufferGeometry().setFromPoints(waistPoints);
        const waist = new THREE.Line(waistGeometry, material);
        person.add(waist);

        // Left Leg (pants - using box geometry)
        const leftLegGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.15);
        const leftLegEdges = new THREE.EdgesGeometry(leftLegGeometry);
        const leftLegMesh = new THREE.LineSegments(leftLegEdges, material);
        leftLegMesh.position.set(-0.12, 0.1, 0);
        person.add(leftLegMesh);

        // Right Leg (pants)
        const rightLegGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.15);
        const rightLegEdges = new THREE.EdgesGeometry(rightLegGeometry);
        const rightLegMesh = new THREE.LineSegments(rightLegEdges, material);
        rightLegMesh.position.set(0.12, 0.1, 0);
        person.add(rightLegMesh);

        // Feet
        const leftFootGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.25);
        const leftFootEdges = new THREE.EdgesGeometry(leftFootGeometry);
        const leftFoot = new THREE.LineSegments(leftFootEdges, material);
        leftFoot.position.set(-0.12, -0.3, 0.05);
        person.add(leftFoot);

        const rightFootGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.25);
        const rightFootEdges = new THREE.EdgesGeometry(rightFootGeometry);
        const rightFoot = new THREE.LineSegments(rightFootEdges, material);
        rightFoot.position.set(0.12, -0.3, 0.05);
        person.add(rightFoot);

        // Arms (will be animated) - create arm segments
        const leftUpperArm = new THREE.Group();
        const leftUpperArmPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -0.4, 0)
        ];
        const leftUpperArmGeo = new THREE.BufferGeometry().setFromPoints(leftUpperArmPoints);
        const leftUpperArmLine = new THREE.Line(leftUpperArmGeo, material);
        leftUpperArm.add(leftUpperArmLine);
        leftUpperArm.position.set(-0.25, 1.1, 0);
        person.add(leftUpperArm);
        person.userData.leftUpperArm = leftUpperArm;

        const leftForearm = new THREE.Group();
        const leftForearmPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -0.4, 0.1)
        ];
        const leftForearmGeo = new THREE.BufferGeometry().setFromPoints(leftForearmPoints);
        const leftForearmLine = new THREE.Line(leftForearmGeo, material);
        leftForearm.add(leftForearmLine);
        person.add(leftForearm);
        person.userData.leftForearm = leftForearm;

        const rightUpperArm = new THREE.Group();
        const rightUpperArmPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -0.4, 0)
        ];
        const rightUpperArmGeo = new THREE.BufferGeometry().setFromPoints(rightUpperArmPoints);
        const rightUpperArmLine = new THREE.Line(rightUpperArmGeo, material);
        rightUpperArm.add(rightUpperArmLine);
        rightUpperArm.position.set(0.25, 1.1, 0);
        person.add(rightUpperArm);
        person.userData.rightUpperArm = rightUpperArm;

        const rightForearm = new THREE.Group();
        const rightForearmPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -0.4, 0.1)
        ];
        const rightForearmGeo = new THREE.BufferGeometry().setFromPoints(rightForearmPoints);
        const rightForearmLine = new THREE.Line(rightForearmGeo, material);
        rightForearm.add(rightForearmLine);
        person.add(rightForearm);
        person.userData.rightForearm = rightForearm;

        person.position.set(x, y, z);
        return person;
    }

    createSpeechBubble(direction = 'left') {
        const bubble = new THREE.Group();
        const material = new THREE.LineBasicMaterial({
            color: 0x000000, // Black
            transparent: true,
            opacity: 0.6
        });

        // Bubble oval (wireframe)
        const bubbleGeometry = new THREE.SphereGeometry(0.6, 12, 8);
        bubbleGeometry.scale(1.2, 0.8, 1);
        const bubbleEdges = new THREE.EdgesGeometry(bubbleGeometry);
        const bubbleMesh = new THREE.LineSegments(bubbleEdges, material);
        bubble.add(bubbleMesh);

        // Tail (small triangle) - direction dependent
        let tailPoints;
        if (direction === 'left') {
            // Arrow pointing to bottom-left
            tailPoints = [
                new THREE.Vector3(-0.3, -0.5, 0),
                new THREE.Vector3(-0.5, -0.8, 0),
                new THREE.Vector3(-0.2, -0.6, 0),
                new THREE.Vector3(-0.3, -0.5, 0)
            ];
        } else {
            // Arrow pointing to bottom-right
            tailPoints = [
                new THREE.Vector3(0.3, -0.5, 0),
                new THREE.Vector3(0.5, -0.8, 0),
                new THREE.Vector3(0.2, -0.6, 0),
                new THREE.Vector3(0.3, -0.5, 0)
            ];
        }
        const tailGeometry = new THREE.BufferGeometry().setFromPoints(tailPoints);
        const tail = new THREE.Line(tailGeometry, material);
        bubble.add(tail);

        // Communication waves inside bubble
        for (let i = 0; i < 3; i++) {
            const wavePoints = [
                new THREE.Vector3(-0.4, -0.2 + i * 0.2, 0.1),
                new THREE.Vector3(0.4, -0.2 + i * 0.2, 0.1)
            ];
            const waveGeometry = new THREE.BufferGeometry().setFromPoints(wavePoints);
            const wave = new THREE.Line(waveGeometry, material);
            bubble.add(wave);
        }

        return bubble;
    }

    createParticles() {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 15;
            positions[i + 1] = (Math.random() - 0.5) * 10;
            positions[i + 2] = (Math.random() - 0.5) * 10;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x000000, // Black
            size: 0.05,
            transparent: true,
            opacity: 0.3
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createGround() {
        // Create ground grid to represent street/pavement
        const gridMaterial = new THREE.LineBasicMaterial({
            color: 0x000000, // Black
            transparent: true,
            opacity: 0.2
        });

        const gridSize = 20;
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x000000);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.2;
        gridHelper.position.y = -0.8;
        this.scene.add(gridHelper);

        // Add some street lines
        const streetLineMaterial = new THREE.LineBasicMaterial({
            color: 0x000000, // Black
            transparent: true,
            opacity: 0.4
        });

        // Center line
        const centerLinePoints = [
            new THREE.Vector3(-5, -0.75, 0),
            new THREE.Vector3(10, -0.75, 0)
        ];
        const centerLineGeometry = new THREE.BufferGeometry().setFromPoints(centerLinePoints);
        const centerLine = new THREE.Line(centerLineGeometry, streetLineMaterial);
        this.scene.add(centerLine);
    }

    createTree(x, y, z) {
        const tree = new THREE.Group();

        // Trunk material - dark wood (brown)
        const trunkMaterial = new THREE.LineBasicMaterial({
            color: 0x4a3728, // Dark wood brown
            transparent: true,
            opacity: 0.8
        });

        // Leaves material - green
        const leavesMaterial = new THREE.LineBasicMaterial({
            color: 0x2d5016, // Dark green
            transparent: true,
            opacity: 0.7
        });

        // Trunk - larger cylinder wireframe for big tree
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 12); // Bigger and more segments
        const trunkEdges = new THREE.EdgesGeometry(trunkGeometry);
        const trunk = new THREE.LineSegments(trunkEdges, trunkMaterial);
        trunk.position.y = 2;
        tree.add(trunk);

        // Leaves - multiple larger spheres for foliage with denser wireframes
        // Bottom layer - largest
        const leaves1Geometry = new THREE.SphereGeometry(1.5, 16, 12); // Increased segments
        const leaves1Edges = new THREE.EdgesGeometry(leaves1Geometry);
        const leaves1 = new THREE.LineSegments(leaves1Edges, leavesMaterial);
        leaves1.position.y = 4.2;
        tree.add(leaves1);

        // Middle-bottom layer
        const leaves2Geometry = new THREE.SphereGeometry(1.4, 14, 10);
        const leaves2Edges = new THREE.EdgesGeometry(leaves2Geometry);
        const leaves2 = new THREE.LineSegments(leaves2Edges, leavesMaterial);
        leaves2.position.y = 5.0;
        tree.add(leaves2);

        // Middle layer
        const leaves3Geometry = new THREE.SphereGeometry(1.2, 12, 10);
        const leaves3Edges = new THREE.EdgesGeometry(leaves3Geometry);
        const leaves3 = new THREE.LineSegments(leaves3Edges, leavesMaterial);
        leaves3.position.y = 5.7;
        tree.add(leaves3);

        // Top layer
        const leaves4Geometry = new THREE.SphereGeometry(0.9, 10, 8);
        const leaves4Edges = new THREE.EdgesGeometry(leaves4Geometry);
        const leaves4 = new THREE.LineSegments(leaves4Edges, leavesMaterial);
        leaves4.position.y = 6.3;
        tree.add(leaves4);

        // Add some branches - larger scale
        const branchMaterial = new THREE.LineBasicMaterial({
            color: 0x5a4738, // Lighter brown for branches
            transparent: true,
            opacity: 0.6
        });

        // Left branch 1
        const leftBranch1Points = [
            new THREE.Vector3(0, 3.8, 0),
            new THREE.Vector3(-0.8, 4.2, 0.3),
            new THREE.Vector3(-1.2, 4.5, 0.5)
        ];
        const leftBranch1Geometry = new THREE.BufferGeometry().setFromPoints(leftBranch1Points);
        const leftBranch1 = new THREE.Line(leftBranch1Geometry, branchMaterial);
        tree.add(leftBranch1);

        // Left branch 2
        const leftBranch2Points = [
            new THREE.Vector3(0, 3.2, 0),
            new THREE.Vector3(-0.6, 3.5, -0.3),
            new THREE.Vector3(-1.0, 3.7, -0.4)
        ];
        const leftBranch2Geometry = new THREE.BufferGeometry().setFromPoints(leftBranch2Points);
        const leftBranch2 = new THREE.Line(leftBranch2Geometry, branchMaterial);
        tree.add(leftBranch2);

        // Right branch 1
        const rightBranch1Points = [
            new THREE.Vector3(0, 3.5, 0),
            new THREE.Vector3(0.8, 3.9, -0.3),
            new THREE.Vector3(1.2, 4.2, -0.5)
        ];
        const rightBranch1Geometry = new THREE.BufferGeometry().setFromPoints(rightBranch1Points);
        const rightBranch1 = new THREE.Line(rightBranch1Geometry, branchMaterial);
        tree.add(rightBranch1);

        // Right branch 2
        const rightBranch2Points = [
            new THREE.Vector3(0, 4.2, 0),
            new THREE.Vector3(0.7, 4.6, 0.2),
            new THREE.Vector3(1.0, 4.9, 0.3)
        ];
        const rightBranch2Geometry = new THREE.BufferGeometry().setFromPoints(rightBranch2Points);
        const rightBranch2 = new THREE.Line(rightBranch2Geometry, branchMaterial);
        tree.add(rightBranch2);

        tree.position.set(x, y, z);
        this.scene.add(tree);

        return tree;
    }

    updateBubbleOpacity(bubble, opacity) {
        // Update opacity for all children (lines, shapes) in the bubble
        bubble.traverse((child) => {
            if (child.material) {
                child.material.opacity = opacity * 0.6; // Base opacity multiplied by current fade
            }
        });
    }

    updateArmGestures(person, time, isSpeaking) {
        const leftUpperArm = person.userData.leftUpperArm;
        const leftForearm = person.userData.leftForearm;
        const rightUpperArm = person.userData.rightUpperArm;
        const rightForearm = person.userData.rightForearm;

        if (!leftUpperArm || !rightUpperArm) return;

        if (isSpeaking) {
            // Animated gestures when speaking - more expressive
            const gesture1 = Math.sin(time * 3) * 0.4;
            const gesture2 = Math.cos(time * 3) * 0.3;

            // Left arm - raise and lower while speaking
            leftUpperArm.rotation.z = 0.3 + gesture1;
            leftUpperArm.rotation.x = gesture2 * 0.3;

            leftForearm.position.set(-0.25, 0.7 + gesture1 * 0.5, 0.1);
            leftForearm.rotation.z = -0.5 + gesture2 * 0.5;

            // Right arm - opposite motion
            rightUpperArm.rotation.z = -0.3 - gesture1;
            rightUpperArm.rotation.x = -gesture2 * 0.3;

            rightForearm.position.set(0.25, 0.7 - gesture1 * 0.5, 0.1);
            rightForearm.rotation.z = 0.5 - gesture2 * 0.5;

        } else {
            // Relaxed position when listening
            leftUpperArm.rotation.z = 0.1;
            leftUpperArm.rotation.x = 0;
            leftForearm.position.set(-0.25, 0.7, 0);
            leftForearm.rotation.z = -0.2;

            rightUpperArm.rotation.z = -0.1;
            rightUpperArm.rotation.x = 0;
            rightForearm.position.set(0.25, 0.7, 0);
            rightForearm.rotation.z = 0.2;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.clock) {
            console.error('Clock not initialized');
            return;
        }

        const time = this.clock.getElapsedTime();
        const delta = 1 / 60; // Approximate delta for smooth animation

        // Simple alternating logic using time directly - switches every 2 seconds
        // Math.floor(time / 2) gives us 0, 1, 2, 3, 4...
        // % 2 gives us 0, 1, 0, 1, 0, 1...
        const currentSpeaker = Math.floor(time / 2) % 2;

        const person1Speaking = currentSpeaker === 0;
        const person2Speaking = currentSpeaker === 1;

        console.log('Time:', time.toFixed(2), 'Speaker:', currentSpeaker, 'P1:', person1Speaking, 'P2:', person2Speaking);

        // Animate speech bubbles with smooth fade in/out
        if (this.bubble1 && this.bubble2) {
            const fadeSpeed = 2.0; // Fade speed
            const floatSpeed = 0.3; // Speed of upward movement when fading out

            // Update target opacity based on who's speaking
            this.bubble1.userData.targetOpacity = person1Speaking ? 1.0 : 0.0;
            this.bubble2.userData.targetOpacity = person2Speaking ? 1.0 : 0.0;

            // Smooth opacity transition for bubble1
            const opacityDiff1 = this.bubble1.userData.targetOpacity - this.bubble1.userData.opacity;
            this.bubble1.userData.opacity += opacityDiff1 * fadeSpeed * delta;

            // Smooth opacity transition for bubble2
            const opacityDiff2 = this.bubble2.userData.targetOpacity - this.bubble2.userData.opacity;
            this.bubble2.userData.opacity += opacityDiff2 * fadeSpeed * delta;

            // Animate bubble1
            const baseFloat1 = Math.sin(time * 2) * 0.1;
            const fadeOffset1 = person1Speaking ? 0 : (1.0 - this.bubble1.userData.opacity) * 0.8; // Move up when fading out
            this.bubble1.position.y = this.bubble1.userData.baseY + baseFloat1 + fadeOffset1;
            this.bubble1.position.x = this.bubble1.userData.baseX;
            this.bubble1.rotation.z = Math.sin(time) * 0.05;

            // Animate bubble2
            const baseFloat2 = Math.cos(time * 2) * 0.1;
            const fadeOffset2 = person2Speaking ? 0 : (1.0 - this.bubble2.userData.opacity) * 0.8; // Move up when fading out
            this.bubble2.position.y = this.bubble2.userData.baseY + baseFloat2 + fadeOffset2;
            this.bubble2.position.x = this.bubble2.userData.baseX;
            this.bubble2.rotation.z = Math.cos(time) * 0.05;

            // Pulse animation when speaking
            const pulseSpeed = 3;
            const pulseAmount = 0.1;

            // Update scale and opacity for bubble1
            if (this.bubble1.userData.opacity > 0.01) {
                const scale = (1 + Math.sin(time * pulseSpeed) * pulseAmount) * this.bubble1.userData.opacity;
                this.bubble1.scale.set(scale, scale, scale);
                this.bubble1.visible = true;
                this.updateBubbleOpacity(this.bubble1, this.bubble1.userData.opacity);
            } else {
                this.bubble1.visible = false;
            }

            // Update scale and opacity for bubble2
            if (this.bubble2.userData.opacity > 0.01) {
                const scale = (1 + Math.cos(time * pulseSpeed) * pulseAmount) * this.bubble2.userData.opacity;
                this.bubble2.scale.set(scale, scale, scale);
                this.bubble2.visible = true;
                this.updateBubbleOpacity(this.bubble2, this.bubble2.userData.opacity);
            } else {
                this.bubble2.visible = false;
            }
        }

        // Update arm gestures
        if (this.person1 && this.person2) {
            this.updateArmGestures(this.person1, time, person1Speaking);
            this.updateArmGestures(this.person2, time, person2Speaking);

            // Update shirt brightness based on who is speaking
            if (this.person1.userData.torso) {
                const opacity = person1Speaking ? 1.0 : 0.6;
                this.person1.userData.torso.material.opacity = opacity;
            }
            if (this.person2.userData.torso) {
                const opacity = person2Speaking ? 1.0 : 0.6;
                this.person2.userData.torso.material.opacity = opacity;
            }
        }

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y = time * 0.05;
        }

        // Smooth circular orbit around the people at constant distance
        const centerX = 4.5; // Center point between the two people
        const centerY = 0.5;
        const centerZ = 0;

        const cameraRadius = 5.5; // Constant distance from center
        const cameraSpeed = 0.1; // Rotation speed
        const cameraAngle = time * cameraSpeed;

        // Camera orbits in a circle at constant height
        this.camera.position.x = centerX + Math.sin(cameraAngle) * cameraRadius;
        this.camera.position.z = centerZ + Math.cos(cameraAngle) * cameraRadius;
        this.camera.position.y = 1.5; // Constant height for stable view

        // Always look at the center point between the two people
        this.camera.lookAt(centerX, centerY, centerZ);

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
        console.log('Creating Hero3DConversationThree instance');
        new Hero3DConversationThree('hero-3d-canvas');
    } else {
        console.error('Canvas element #hero-3d-canvas not found!');
    }
});
