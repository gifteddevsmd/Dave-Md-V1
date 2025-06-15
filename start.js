const path = require('path');
const { spawn } = require('child_process');

function start() {
    const args = [path.join(__dirname, 'index.js'), ...process.argv.slice(2)];
    const proc = spawn(process.argv[0], args, {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    proc.on('message', (msg) => {
        if (msg === 'reset') {
            console.log('[Dave-Md-V1] Restarting bot due to reset signal...');
            proc.kill();
            start();
        }
    });

    proc.on('exit', (code) => {
        console.log(`[Dave-Md-V1] Process exited with code ${code}`);
        if (code === 0 || code === 1) {
            console.log('[Dave-Md-V1] Restarting...');
            start();
        } else {
            console.error('[Dave-Md-V1] Unhandled exit. Manual restart may be needed.');
        }
    });

    proc.on('error', (err) => {
        console.error('[Dave-Md-V1] Process error:', err);
    });
}

start();
