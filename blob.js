const canvas = document.getElementById('inkCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay-text');

let width, height;
const blots = [];
let hasStarted = false;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const palette = [
    'rgba(20, 20, 40, 0.05)',
    'rgba(0, 100, 150, 0.05)',
    'rgba(120, 20, 60, 0.05)',
    'rgba(40, 100, 40, 0.05)',
    'rgba(90, 30, 120, 0.05)'
];

class InkBlot {
    constructor(x, y, charCode, isRepeat) {
        this.x = x;
        this.y = y;

        const  pressureMultiplier = isRepeat ? 2.5 : 1;

        this.color = palette[charCode % palette.length];
        this.baseRadius = (20 + (charCode % 40)) * pressureMultiplier;
        this.numPoints = 8 + Math.floor(Math.random() * 13);

        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;

        this.points = [];
        this.timeOffset = Math.random() * 1000;

        for (let i = 0; i < this.numPoints; i++) { 
            this.points.push({
                angle: (i / this.numPoints) * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03,
                variance: 10 + Math.random() * 20
            });
        }
    }

    updateAndDraw(ctx, time) {
        this.x = (this.x + this.vx + width) % width;
        this.y = (this.y + this.vy + height) % height;

        ctx.fillStyle = this.color;
        ctx.beginPath();

        for(let i = 0; i < this.numPoints; i++) {
            const p = this.points[i];
            const nextP = this.points[(i + 1) % this.numPoints];

            const currentR = this.baseRadius + Math.sin(time * p.speed + this.timeOffset) * p.variance;
            const nextR = this.baseRadius + Math.sin(time * nextP.speed + this.timeOffset) * nextP.variance;

            const px = this.x + Math.cos(p.angle) * currentR;
            const py = this.y + Math.sin(p.angle) * currentR;

            const nextPx = this.x + Math.cos(nextP.angle) * nextR;
            const nextPy = this.y + Math.sin(nextP.angle) * nextR;

            const cx = (px + nextPx) / 2;
            const cy = (py + nextPy) / 2;

            if (i === 0) ctx.moveTo(px, py);
            ctx.quadraticCurveTo(px, py, cx, cy);
        }

        ctx.closePath();
        ctx.fill();
    }
}

function spawnBlot(x, y, charCode, isRepeat) {
    blots.push(new InkBlot(x, y, charCode, isRepeat));
    if (blots.length > 60) blots.shift();
}

function hideOverlay() {
    if (!hasStarted) {
        hasStarted = true;
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 500);
    }
}

document.addEventListener('click', () => {
    canvas.focus();
    hideOverlay();
});

document.addEventListener('keydown', (e) => {
    hideOverlay();

    const spawnX = (width / 2) + (Math.random() - 0.5) * 300;
    const spawnY = (height / 2) + (Math.random() - 0.5) * 300;
    const charCode = e.key.charCodeAt(0) || 0;

    spawnBlot(spawnX, spawnY, charCode, e.repeat);
});

for(let i=0; i<3; i++) {
    const x = (width / 2) + (Math.random() - 0.5) * 200;
    const y = (height / 2) + (Math.random() - 0.5) * 200;
    const fakeChareCode = Math.floor(Math.random() * 100);
    spawnBlot(x, y, fakeChareCode, false);
}

canvas.focus();

function animate(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'multiply';
    blots.forEach(blots => {
        for(let i=0; 1<3; i++) blots.updateAndDraw(ctx, time);
    });

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(animate);
}

animate(0);