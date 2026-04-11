// ========================================
// server-manager.js
// Starts, checks, and stops the TCP server
// ========================================

var { spawn } = require('child_process');
var net = require('net');
var path = require('path');
var config = require('../config.json');

var SERVER_PORT = config.server.port;
var STARTUP_WAIT = config.server.startup_wait_ms;

// ========================================
// Check if something is already listening on the server port
// ========================================
function isServerRunning() {
    return new Promise(function (resolve) {
        var socket = net.connect(SERVER_PORT, function () {
            socket.end();
            resolve(true);
        });
        socket.on('error', function () {
            resolve(false);
        });
        setTimeout(function () {
            socket.end();
            resolve(false);
        }, config.server.connection_timeout_ms);
    });
}

// ========================================
// Start the TCP server as a child process
// ========================================
function startServer() {
    return new Promise(function (resolve) {
        var serverPath = path.join(__dirname, '..', 'tcp-server-v3', 'server', 'index.js');
        var serverProcess = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            detached: true
        });

        serverProcess.stdout.on('data', function (data) {
            console.log('[TCP Server] ' + data.toString().trim());
        });

        // Wait for server to bind to the port
        setTimeout(function () {
            resolve(serverProcess);
        }, STARTUP_WAIT);
    });
}

// ========================================
// Kill the server process
// ========================================
function stopServer(serverProcess) {
    if (!serverProcess) return;
    try {
        process.kill(-serverProcess.pid);
    } catch (e) {
        // Already exited
    }
}

module.exports = {
    isServerRunning: isServerRunning,
    startServer: startServer,
    stopServer: stopServer
};
