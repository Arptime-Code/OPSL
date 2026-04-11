// ========================================
// start-tcp-server.js
// Standalone script to start the OPSL TCP server
// Usage: node start-tcp-server.js
// ========================================

const { spawn } = require('child_process');
const path = require('path');
const net = require('net');

// Configuration
var SERVER_PORT = 3000;
var CONNECTION_TIMEOUT = 1000;
var STARTUP_WAIT = 1000;

// ========================================
// Check if something is listening on a port
// ========================================
function isServerRunning(port) {
    return new Promise(function (resolve) {
        var socket = net.connect(port, function () {
            socket.end();
            resolve(true);
        });
        socket.on('error', function () {
            resolve(false);
        });
        setTimeout(function () {
            socket.end();
            resolve(false);
        }, CONNECTION_TIMEOUT);
    });
}

// ========================================
// Start the TCP server if it isn't already running
// ========================================
async function startServer() {
    // Check if already running
    var running = await isServerRunning(SERVER_PORT);
    if (running) {
        console.log('TCP server is already running on port ' + SERVER_PORT);
        return;
    }

    console.log('Starting TCP server on port ' + SERVER_PORT + '...');

    // Spawn the server process
    var serverPath = path.join(__dirname, 'tcp-server-v3', 'server', 'index.js');
    var serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: true
    });

    // Forward server output to console
    forwardOutput(serverProcess);

    // Wait for server to bind
    await waitMs(STARTUP_WAIT);

    // Verify it started
    verifyStartup(SERVER_PORT, serverProcess);
}

// ========================================
// Forward server stdout/stderr to parent console
// ========================================
function forwardOutput(serverProcess) {
    serverProcess.stdout.on('data', function (data) {
        console.log('[TCP Server] ' + data.toString().trim());
    });

    serverProcess.stderr.on('data', function (data) {
        console.error('[TCP Server Error] ' + data.toString().trim());
    });

    serverProcess.on('error', function (error) {
        console.error('Failed to start TCP server: ' + error.message);
    });
}

// ========================================
// Verify the server is actually listening
// ========================================
async function verifyStartup(port, serverProcess) {
    var started = await isServerRunning(port);
    if (started) {
        console.log('TCP server started successfully on port ' + port);
        console.log('Server PID: ' + serverProcess.pid);
    } else {
        console.error('Failed to verify TCP server startup');
    }
}

// ========================================
// Simple delay helper
// ========================================
function waitMs(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

// ========================================
// Run
// ========================================
startServer().catch(function (err) {
    console.error(err);
});
