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