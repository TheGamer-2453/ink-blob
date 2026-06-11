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
    'rgba(20, 20, 40, 0.15)',   
    'rgba(0, 100, 150, 0.15)',  
    'rgba(120, 20, 60, 0.15)',  
    'rgba(40, 100, 40, 0.15)',  
    'rgba(90, 30, 120, 0.15)'   
];

class InkBlot {
    constructor(x, y, charCode, isrepeat) {
        this.x = x;
        this.y = y;

        this.color = palette[charCode % palette.length];
        this.baseRadius = (15 + (charCode % 30)) * (isrepeat ? 2 : 1);
        this.numPoints = 8 + (charCode % 8);

        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;

        this.points = [];
        this.timeOffset = Math.random() * 1000;

        for(let i = 0; 1 < this.numPoints; i++){
            this.points.push({
                angle: (i / this.numPoints) * Math.PI * 2,
                speed: 0.002 + Math.random() * 0.003,
                variance: 5 + Math.random() * 15
            });
        }
    }

    update(time) {
        this.x = (this.x + this.vx + width) % width;
        this.y = (this.y + this.vy + height) % height;
        
        this.points.forEach(p => {
            p.currentR = this.baseRadius + Math.sin(time * p.speed + this.timeOffset) * p.variance;
        });
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();

        for (let i = 0; i < this.numPoints; i++) {
            const p = this.points[i];
            const nextP = this.points[(i + 1) % this.numPoints];
            
            const px = this.x + Math.cos(p.angle) * p.currentR;
            const py = this.y + Math.sin(p.angle) * p.currentR;
            
            const nextPx = this.x + Math.cos(nextP.angle) * nextP.currentR;
            const nextPy = this.y + Math.sin(nextP.angle) * nextP.currentR;

            const cx = (px + nextPx) / 2;
            const cy = (py + nextPy) / 2;

            if (i === 0) ctx.moveTo(px, py);
            ctx.quadraticCurveTo(px, py, cx, cy);
        }
        
        ctx.closePath();
        ctx.fill();
    }
}

function spawnBlots(x, y, charCode, isrepeat) {
    blots.push(new InkBlot(x, y, charCode, isrepeat));
    if (blots.length > 40) blots.shift();
}

document.addEventListener('click', () => {
    canvas.focus();
    if (!hasStarted) {
        hasStarted = true;
        overlay.style.opacity = '0';
    }
});

document.addEventListener('keydown', (e) => {
    if (!hasStarted) {
        hasStarted = true;
        overlay.style.opacity = '0';
    }
    
    const spawnX = (width / 2) + (Math.random() - 0.5) * 200;
    const spawnY = (height / 2) + (Math.random() - 0.5) * 200;
    spawnBlot(spawnX, spawnY, e.key.charCodeAt(0) || 0, e.repeat);
});

for(let i=0; i<3; i++) {
    spawnBlot(width/2 + Math.random()*100, height/2 + Math.random()*100, i*10, false);
}

function animate(time) {
    ctx.clearRect(0, 0, width, height);

    blots.forEach(blot => {
        blot.update(time); 
        blot.draw(ctx);    
    });

    requestAnimationFrame(animate);
}


canvas.focus();
requestAnimationFrame(animate);