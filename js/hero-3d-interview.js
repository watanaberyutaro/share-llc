// 3D Hero Background - Two People Having Interview Conversation
// Wireframe people sitting on chairs, facing each other

class Hero3DInterview {
    constructor(canvasId) {
        console.log('Hero3DInterview constructor called with canvasId:', canvasId);
        this.canvas = document.getElementById(canvasId);
        console.log('Canvas element:', this.canvas);

        if (!this.canvas) {
            console.error('Canvas not found in constructor!');
            return;
        }

        console.log('THREE defined?', typeof THREE);

        this.clock = null;
        this.speechBubbles = [];
        this.speechTimer = 0;
        this.currentSpeaker = 0; // 0 = interviewer, 1 = interviewee

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
        // Fixed camera position - 20 degrees to the right from front
        this.camera.position.set(2, 3, 5.5);
        this.camera.lookAt(0, 1.2, 0);

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

        // Create interviewer (left) and interviewee (right) - sitting on low sofas
        this.interviewer = this.createPersonSitting(-2, 0.4, 0.15, 0x000000);
        this.interviewee = this.createPersonSitting(2, 0.4, 0.15, 0x4ecdc4); // Teal color

        // Create low sofas instead of chairs
        this.createLowSofa(-2, 0, 0);
        this.createLowSofa(2, 0, 0);

        // Create table between them
        this.createTable();

        // Create plants
        this.createPlant(-3.5, 0, -1.5);
        this.createPlant(3.5, 0, -1.5);
        this.createPlant(0, 0, -3);

        // Create background particles
        this.createParticles();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation
        this.animate();

        console.log('Three.js scene initialized successfully');
    }

    createPersonSitting(x, y, z, color) {
        const person = new THREE.Group();

        // Black material for body parts
        const blackMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9
        });

        // Colorful material for clothes (torso)
        const colorfulMaterial = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });

        // Head - black
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headEdges = new THREE.EdgesGeometry(headGeometry);
        const head = new THREE.LineSegments(headEdges, blackMaterial);
        head.position.y = 1.8;
        person.add(head);

        // Torso - colorful (clothes)
        const torsoGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.3);
        const torsoEdges = new THREE.EdgesGeometry(torsoGeometry);
        const torso = new THREE.LineSegments(torsoEdges, colorfulMaterial);
        torso.position.y = 1.2;
        person.add(torso);

        // Left arm (on lap) - black
        const leftArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
        const leftArmEdges = new THREE.EdgesGeometry(leftArmGeometry);
        const leftArm = new THREE.LineSegments(leftArmEdges, blackMaterial);
        leftArm.position.set(-0.3, 1.1, 0);
        leftArm.rotation.z = 0.5;
        person.add(leftArm);

        // Right arm (gesturing) - black
        const rightArmGroup = new THREE.Group();
        const rightUpperArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
        const rightUpperArmEdges = new THREE.EdgesGeometry(rightUpperArmGeometry);
        const rightUpperArm = new THREE.LineSegments(rightUpperArmEdges, blackMaterial);
        rightUpperArm.position.y = 1.3;
        rightUpperArm.rotation.z = -0.3;
        rightArmGroup.add(rightUpperArm);

        const rightLowerArmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6);
        const rightLowerArmEdges = new THREE.EdgesGeometry(rightLowerArmGeometry);
        const rightLowerArm = new THREE.LineSegments(rightLowerArmEdges, blackMaterial);
        rightLowerArm.position.set(0.15, 1.15, 0.1);
        rightLowerArm.rotation.z = -0.5;
        rightLowerArm.rotation.x = -0.3;
        rightArmGroup.add(rightLowerArm);

        rightArmGroup.position.set(0.3, 0, 0);
        person.add(rightArmGroup);

        // Upper legs (thighs) - sitting position on low sofa - black
        const leftThighGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6);
        const leftThighEdges = new THREE.EdgesGeometry(leftThighGeometry);
        const leftThigh = new THREE.LineSegments(leftThighEdges, blackMaterial);
        leftThigh.position.set(-0.12, 1.1, 0.1);
        leftThigh.rotation.x = Math.PI / 2.5; // Slight angle
        person.add(leftThigh);

        const rightThighGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6);
        const rightThighEdges = new THREE.EdgesGeometry(rightThighGeometry);
        const rightThigh = new THREE.LineSegments(rightThighEdges, blackMaterial);
        rightThigh.position.set(0.12, 1.1, 0.1);
        rightThigh.rotation.x = Math.PI / 2.5; // Slight angle
        person.add(rightThigh);

        // Lower legs (shins) - relaxed position - black
        const leftShinGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6);
        const leftShinEdges = new THREE.EdgesGeometry(leftShinGeometry);
        const leftShin = new THREE.LineSegments(leftShinEdges, blackMaterial);
        leftShin.position.set(-0.12, 0.6, 0.35);
        leftShin.rotation.x = -0.2;
        person.add(leftShin);

        const rightShinGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6);
        const rightShinEdges = new THREE.EdgesGeometry(rightShinGeometry);
        const rightShin = new THREE.LineSegments(rightShinEdges, blackMaterial);
        rightShin.position.set(0.12, 0.6, 0.35);
        rightShin.rotation.x = -0.2;
        person.add(rightShin);

        person.position.set(x, y, z);
        person.userData.head = head;
        person.userData.rightArmGroup = rightArmGroup;

        this.scene.add(person);
        return person;
    }

    createGround() {
        // Wireframe grid ground
        const gridSize = 15;
        const gridDivisions = 15;

        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x000000, 0x000000);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.2;
        this.scene.add(gridHelper);

        // Plane outline
        const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
        const planeEdges = new THREE.EdgesGeometry(planeGeometry);
        const planeMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.15
        });
        const plane = new THREE.LineSegments(planeEdges, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.05;
        this.scene.add(plane);
    }

    createLowSofa(x, y, z) {
        const sofa = new THREE.Group();
        const sofaMaterial = new THREE.LineBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });

        // Seat - wider and deeper
        const seatGeometry = new THREE.BoxGeometry(1.0, 0.3, 0.8);
        const seatEdges = new THREE.EdgesGeometry(seatGeometry);
        const seat = new THREE.LineSegments(seatEdges, sofaMaterial);
        seat.position.y = 0.4;
        sofa.add(seat);

        // Backrest - lower and wider
        const backrestGeometry = new THREE.BoxGeometry(1.0, 0.6, 0.15);
        const backrestEdges = new THREE.EdgesGeometry(backrestGeometry);
        const backrest = new THREE.LineSegments(backrestEdges, sofaMaterial);
        backrest.position.set(0, 0.65, -0.32);
        sofa.add(backrest);

        // Armrests
        const armrestGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.6);
        const armrestEdges = new THREE.EdgesGeometry(armrestGeometry);

        const leftArmrest = new THREE.LineSegments(armrestEdges, sofaMaterial);
        leftArmrest.position.set(-0.5, 0.55, -0.1);
        sofa.add(leftArmrest);

        const rightArmrest = new THREE.LineSegments(armrestEdges.clone(), sofaMaterial);
        rightArmrest.position.set(0.5, 0.55, -0.1);
        sofa.add(rightArmrest);

        // Base/legs - low profile
        const baseGeometry = new THREE.BoxGeometry(0.95, 0.1, 0.75);
        const baseEdges = new THREE.EdgesGeometry(baseGeometry);
        const base = new THREE.LineSegments(baseEdges, sofaMaterial);
        base.position.y = 0.05;
        sofa.add(base);

        sofa.position.set(x, y, z);
        this.scene.add(sofa);
    }

    createPlant(x, y, z) {
        const plant = new THREE.Group();
        const plantMaterial = new THREE.LineBasicMaterial({
            color: 0x2d5016,
            transparent: true,
            opacity: 0.8
        });

        // Pot
        const potGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.4, 8);
        const potEdges = new THREE.EdgesGeometry(potGeometry);
        const potMaterial = new THREE.LineBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.7
        });
        const pot = new THREE.LineSegments(potEdges, potMaterial);
        pot.position.y = 0.2;
        plant.add(pot);

        // Main stem
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6);
        const stemEdges = new THREE.EdgesGeometry(stemGeometry);
        const stem = new THREE.LineSegments(stemEdges, plantMaterial);
        stem.position.y = 0.9;
        plant.add(stem);

        // Leaves - create several at different heights
        for (let i = 0; i < 5; i++) {
            const leafHeight = 0.6 + i * 0.25;
            const angle = (i * Math.PI * 2) / 5;

            // Leaf as elongated triangle
            const leafPoints = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0.3 * Math.cos(angle), 0.2, 0.3 * Math.sin(angle)),
                new THREE.Vector3(0.15 * Math.cos(angle), 0, 0.15 * Math.sin(angle)),
                new THREE.Vector3(0, 0, 0)
            ];
            const leafGeometry = new THREE.BufferGeometry().setFromPoints(leafPoints);
            const leaf = new THREE.Line(leafGeometry, plantMaterial);
            leaf.position.y = leafHeight;
            plant.add(leaf);
        }

        plant.position.set(x, y, z);
        this.scene.add(plant);
    }

    createTable() {
        const table = new THREE.Group();
        const tableMaterial = new THREE.LineBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.7
        });

        // Table top
        const topGeometry = new THREE.BoxGeometry(1.5, 0.08, 0.8);
        const topEdges = new THREE.EdgesGeometry(topGeometry);
        const top = new THREE.LineSegments(topEdges, tableMaterial);
        top.position.y = 1.0;
        table.add(top);

        // Table legs
        const legPositions = [
            [-0.6, 0.5, 0.3],
            [0.6, 0.5, 0.3],
            [-0.6, 0.5, -0.3],
            [0.6, 0.5, -0.3]
        ];

        legPositions.forEach(pos => {
            const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6);
            const legEdges = new THREE.EdgesGeometry(legGeometry);
            const leg = new THREE.LineSegments(legEdges, tableMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            table.add(leg);
        });

        // Coffee cups on table
        const cupMaterial = new THREE.LineBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.8
        });

        // Cup 1 (interviewer's side)
        const cup1Geometry = new THREE.CylinderGeometry(0.06, 0.05, 0.12, 8);
        const cup1Edges = new THREE.EdgesGeometry(cup1Geometry);
        const cup1 = new THREE.LineSegments(cup1Edges, cupMaterial);
        cup1.position.set(-0.4, 1.1, 0);
        table.add(cup1);

        // Cup 2 (interviewee's side)
        const cup2Geometry = new THREE.CylinderGeometry(0.06, 0.05, 0.12, 8);
        const cup2Edges = new THREE.EdgesGeometry(cup2Geometry);
        const cup2 = new THREE.LineSegments(cup2Edges, cupMaterial);
        cup2.position.set(0.4, 1.1, 0);
        table.add(cup2);

        table.position.set(0, 0, 0.5);
        this.scene.add(table);
    }

    createSpeechBubble(position, speaker) {
        const bubbleGroup = new THREE.Group();
        const bubbleMaterial = new THREE.LineBasicMaterial({
            color: speaker === 0 ? 0x000000 : 0x4ecdc4,
            transparent: true,
            opacity: 0.8
        });

        // 3D Speech bubble - rounded box
        const bubbleGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.4);
        const bubbleEdges = new THREE.EdgesGeometry(bubbleGeometry);
        const bubble = new THREE.LineSegments(bubbleEdges, bubbleMaterial);
        bubbleGroup.add(bubble);

        // Add rounded corners with small spheres at corners
        const cornerRadius = 0.08;
        const cornerPositions = [
            [-0.4, 0.3, 0.2], [0.4, 0.3, 0.2], [-0.4, -0.3, 0.2], [0.4, -0.3, 0.2],
            [-0.4, 0.3, -0.2], [0.4, 0.3, -0.2], [-0.4, -0.3, -0.2], [0.4, -0.3, -0.2]
        ];

        cornerPositions.forEach(pos => {
            const cornerGeometry = new THREE.SphereGeometry(cornerRadius, 4, 4);
            const cornerEdges = new THREE.EdgesGeometry(cornerGeometry);
            const corner = new THREE.LineSegments(cornerEdges, bubbleMaterial);
            corner.position.set(pos[0], pos[1], pos[2]);
            bubbleGroup.add(corner);
        });

        // 3D tail - small spheres getting smaller
        for (let i = 0; i < 3; i++) {
            const radius = 0.12 - i * 0.03;
            const sphereGeometry = new THREE.SphereGeometry(radius, 6, 6);
            const sphereEdges = new THREE.EdgesGeometry(sphereGeometry);
            const sphere = new THREE.LineSegments(sphereEdges, bubbleMaterial);
            sphere.position.set(-0.5 - i * 0.15, -0.4 - i * 0.15, 0);
            bubbleGroup.add(sphere);
        }

        bubbleGroup.position.copy(position);
        bubbleGroup.userData = {
            age: 0,
            maxAge: 2.0,
            speaker: speaker
        };

        this.speechBubbles.push(bubbleGroup);
        this.scene.add(bubbleGroup);
    }

    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 80;
        const positions = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20;
            positions[i + 1] = Math.random() * 10;
            positions[i + 2] = (Math.random() - 0.5) * 20;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x000000,
            size: 0.03,
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
        // Alternate speech bubbles between interviewer and interviewee
        this.speechTimer += deltaTime;
        if (this.speechTimer >= 4.0) {
            this.speechTimer = 0;
            this.currentSpeaker = 1 - this.currentSpeaker; // Toggle between 0 and 1

            // Create speech bubble
            const position = new THREE.Vector3(
                this.currentSpeaker === 0 ? -2 : 2,
                2.8,
                0
            );
            this.createSpeechBubble(position, this.currentSpeaker);
        }

        // Update speech bubbles
        for (let i = this.speechBubbles.length - 1; i >= 0; i--) {
            const bubble = this.speechBubbles[i];
            bubble.userData.age += deltaTime;

            const progress = bubble.userData.age / bubble.userData.maxAge;

            if (progress >= 1.0) {
                this.scene.remove(bubble);
                this.speechBubbles.splice(i, 1);
            } else {
                // Fade out
                bubble.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = 0.8 * (1.0 - progress);
                    }
                });
            }
        }

        // Animated gestures for current speaker
        if (this.interviewer && this.interviewee) {
            // Head nod animation for current speaker
            const nodAmount = Math.sin(time * 3) * 0.08;

            if (this.currentSpeaker === 0) {
                // Interviewer is speaking
                this.interviewer.userData.head.rotation.x = nodAmount;
                this.interviewee.userData.head.rotation.x = 0;

                // Hand gestures - more active arm movement
                const armRotation1 = Math.sin(time * 2.5) * 0.4;
                const armRotation2 = Math.cos(time * 3) * 0.3;
                this.interviewer.userData.rightArmGroup.rotation.y = armRotation1;
                this.interviewer.userData.rightArmGroup.rotation.z = -0.3 + armRotation2 * 0.2;

                // Interviewee is listening - subtle movement
                this.interviewee.userData.rightArmGroup.rotation.y = Math.sin(time * 0.5) * 0.1;
                this.interviewee.userData.rightArmGroup.rotation.z = 0;
            } else {
                // Interviewee is speaking
                this.interviewer.userData.head.rotation.x = 0;
                this.interviewee.userData.head.rotation.x = nodAmount;

                // Hand gestures - more active arm movement
                const armRotation1 = Math.sin(time * 2.5) * 0.4;
                const armRotation2 = Math.cos(time * 3) * 0.3;
                this.interviewee.userData.rightArmGroup.rotation.y = armRotation1;
                this.interviewee.userData.rightArmGroup.rotation.z = -0.3 + armRotation2 * 0.2;

                // Interviewer is listening - subtle movement
                this.interviewer.userData.rightArmGroup.rotation.y = Math.sin(time * 0.5) * 0.1;
                this.interviewer.userData.rightArmGroup.rotation.z = 0;
            }
        }

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y = time * 0.02;
        }

        // Camera is fixed - no orbit
        // Already set in init() at position (2, 3, 5.5) looking at (0, 1.2, 0)

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
        console.log('Creating Hero3DInterview instance');
        new Hero3DInterview('hero-3d-canvas');
    } else {
        console.error('Canvas element #hero-3d-canvas not found!');
    }
});
