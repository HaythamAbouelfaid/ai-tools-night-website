import { spawn } from 'child_process';

// A tiny zero-dependency replacement for "concurrently" to avoid npm network blocks
console.log("Starting backend server...");
const backend = spawn('node', ['server.js'], { stdio: 'inherit', shell: true });

console.log("Starting frontend server (Vite)...");
const frontend = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
    backend.kill();
    frontend.kill();
    process.exit(0);
});
