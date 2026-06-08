const canvas = document.getElementById('inkCanvas');
const ctx = canvas.getContext('2d');

let width, height;
const blots = [];

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
    constructor(x, y, key, isRepeat){
        this.x = x;
        this.y = y;

        const charCode = key.charCodeAt(0) || 0;

        const pressureMultiplier = isRepeat ? 2.5 : 1;
        
        this.color = palette[charCode % palette.length];
        this.baseRadius = (20 + (charCode % 40)) * pressureMultiplier;
        this.numPoints = 8 + (charCode % 12);

        this.points = [];
        this.timeOffset = Math.random() * 1000;

        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;

        for (let i = 0; i < this.numPoints; 1++) {
            const angle = (i / this.numPoints) * Math.PI * 2;
            this.points.push({
                angle: angle,
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

        for (let i = 0; i < this.numPoints; i++) {
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

            if (i === 0) {
                ctx.moveTo(px, py);
            }
            ctx.quadraticCurveTo(px, py, cx, cy);
        }

        ctx.closePath();
        ctx.fill();
    }
}

window.addEventListener('keydown', (e) => {
    const spawnX = (width / 2) + (Math.random() - 0.5) * 300;
    const spawnY = (height / 2) + (Math.random() - 0.5) * 300;

    blots.push(new InkBlot(spawnX, spawnY, e.key, e.repeat));

    if (blots.length > 60) blots.shift();
});

function animate(time) {
    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'multiply';

    blots.forEach(blot => {
        for(let i=0; i<3; i++) {
            blot.updateAndDraw(ctx, time);
        }
    });

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(animate);
}

animate(0);