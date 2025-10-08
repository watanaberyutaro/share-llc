// 3D Hero Background Animation - People in Conversation
// Wireframe visualization of people talking

class Hero3DConversation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        this.resize();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    // Draw wireframe person figure
    drawPerson(x, y, scale, rotation, color) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);

        const baseOpacity = 0.4;
        this.ctx.strokeStyle = color || `rgba(255, 255, 255, ${baseOpacity})`;
        this.ctx.lineWidth = 2;

        // Head (circle)
        this.ctx.beginPath();
        this.ctx.arc(0, -60, 20, 0, Math.PI * 2);
        this.ctx.stroke();

        // Body (line)
        this.ctx.beginPath();
        this.ctx.moveTo(0, -40);
        this.ctx.lineTo(0, 20);
        this.ctx.stroke();

        // Arms (animated for conversation gesture)
        const armWave = Math.sin(this.time * 2) * 5;

        // Left arm
        this.ctx.beginPath();
        this.ctx.moveTo(0, -20);
        this.ctx.lineTo(-25, -5 + armWave);
        this.ctx.lineTo(-35, 10 + armWave);
        this.ctx.stroke();

        // Right arm
        this.ctx.beginPath();
        this.ctx.moveTo(0, -20);
        this.ctx.lineTo(25, -5 - armWave);
        this.ctx.lineTo(35, 10 - armWave);
        this.ctx.stroke();

        // Legs
        this.ctx.beginPath();
        this.ctx.moveTo(0, 20);
        this.ctx.lineTo(-15, 60);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, 20);
        this.ctx.lineTo(15, 60);
        this.ctx.stroke();

        this.ctx.restore();
    }

    // Draw speech bubble (wireframe)
    drawSpeechBubble(x, y, scale, rotation) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);

        const opacity = 0.3 + Math.sin(this.time * 3) * 0.1;
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.lineWidth = 2;

        // Bubble oval
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 40, 25, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        // Tail
        this.ctx.beginPath();
        this.ctx.moveTo(-20, 15);
        this.ctx.lineTo(-25, 25);
        this.ctx.lineTo(-15, 20);
        this.ctx.stroke();

        // Inner lines (communication waves)
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            const lineY = -10 + i * 10;
            const lineWidth = 20 - i * 3;
            this.ctx.moveTo(-lineWidth, lineY);
            this.ctx.lineTo(lineWidth, lineY);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    // Draw connection lines between people
    drawConnectionLines(person1, person2) {
        const opacity = 0.2 + Math.sin(this.time * 2) * 0.1;
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 10]);

        this.ctx.beginPath();
        this.ctx.moveTo(person1.x, person1.y);

        // Bezier curve for smoother connection
        const midX = (person1.x + person2.x) / 2;
        const midY = (person1.y + person2.y) / 2 - 50;
        this.ctx.quadraticCurveTo(midX, midY, person2.x, person2.y);

        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    // Draw floating particles (communication effect)
    drawParticles() {
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + this.time;
            const radius = 150 + Math.sin(this.time * 2 + i) * 30;
            const x = this.width / 2 + Math.cos(angle) * radius;
            const y = this.height / 2 + Math.sin(angle) * radius;
            const size = 2 + Math.sin(this.time * 3 + i) * 1;
            const opacity = 0.3 + Math.sin(this.time * 2 + i) * 0.2;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.fill();
        }
    }

    // Draw wireframe network grid
    drawNetworkGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        const gridSize = 50;
        const offset = (this.time * 20) % gridSize;

        // Vertical lines
        for (let x = -offset; x < this.width + gridSize; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = -offset; y < this.height + gridSize; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.time += 0.01;

        // Draw background grid
        this.drawNetworkGrid();

        // Draw particles
        this.drawParticles();

        // Define people positions (responsive to screen size)
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        const person1 = {
            x: centerX - 150 - Math.sin(this.time) * 10,
            y: centerY + 50,
            scale: 1 + Math.sin(this.time * 0.5) * 0.05,
            rotation: Math.sin(this.time * 0.3) * 0.05
        };

        const person2 = {
            x: centerX + 150 + Math.cos(this.time) * 10,
            y: centerY + 50,
            scale: 1 + Math.cos(this.time * 0.5) * 0.05,
            rotation: -Math.cos(this.time * 0.3) * 0.05
        };

        const person3 = {
            x: centerX,
            y: centerY - 80 + Math.sin(this.time * 0.7) * 10,
            scale: 0.9 + Math.sin(this.time * 0.6) * 0.05,
            rotation: Math.sin(this.time * 0.4) * 0.05
        };

        // Draw connection lines
        this.drawConnectionLines(person1, person2);
        this.drawConnectionLines(person2, person3);
        this.drawConnectionLines(person3, person1);

        // Draw people
        this.drawPerson(person1.x, person1.y, person1.scale, person1.rotation, 'rgba(255, 255, 255, 0.5)');
        this.drawPerson(person2.x, person2.y, person2.scale, person2.rotation, 'rgba(255, 255, 255, 0.5)');
        this.drawPerson(person3.x, person3.y, person3.scale, person3.rotation, 'rgba(255, 255, 255, 0.4)');

        // Draw speech bubbles
        const bubbleOffset = Math.sin(this.time * 2) * 5;
        this.drawSpeechBubble(
            person1.x - 60,
            person1.y - 90 + bubbleOffset,
            0.8,
            Math.sin(this.time) * 0.1
        );

        this.drawSpeechBubble(
            person2.x + 60,
            person2.y - 90 - bubbleOffset,
            0.8,
            -Math.cos(this.time) * 0.1
        );

        this.drawSpeechBubble(
            person3.x,
            person3.y - 100 + Math.cos(this.time * 1.5) * 5,
            0.7,
            Math.sin(this.time * 0.5) * 0.1
        );

        requestAnimationFrame(() => this.animate());
    }

    addEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
    }
}

// Initialize 3D conversation background when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-3d-canvas');
    if (canvas) {
        new Hero3DConversation('hero-3d-canvas');
    }
});
