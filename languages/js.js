// ========================================
// languages/js.js
// Language adapter for JavaScript libraries
// Spawns 'node library.js' processes
// ========================================

var { spawn } = require('child_process');
var path = require('path');
var config = require('../config.json');

var READY_MARKER = config.workers.ready_marker;
var READY_TIMEOUT = config.workers.ready_timeout_ms;

// Set NODE_PATH to include tcp-server-v3 so libraries can require('opsl-tcp-client')
var NODE_PATH_ENV = Object.assign({}, process.env);
var tcpServerDir = path.join(__dirname, '..', 'tcp-server-v3');
NODE_PATH_ENV.NODE_PATH = tcpServerDir + path.delimiter + (NODE_PATH_ENV.NODE_PATH || '');

// ========================================
// Spawn a JS library as a Node.js child process
// ========================================
function spawnWorker(libraryName, libraryFile) {
    var child = spawn('node', [libraryFile], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: NODE_PATH_ENV
    });

    // Return a promise that resolves when the library signals ready
    return new Promise(function (resolve, reject) {
        var buffer = '';

        child.stdout.on('data', function (data) {
            buffer += data.toString();
            console.log('[' + libraryName + '] ' + data.toString().trim());

            if (buffer.indexOf(READY_MARKER) !== -1) {
                resolve(child);
            }
        });

        child.stderr.on('data', function (data) {
            console.error('[' + libraryName + ' error] ' + data.toString().trim());
        });

        // Timeout fallback
        setTimeout(function () {
            resolve(child); // Resolve anyway — process is running
        }, READY_TIMEOUT);
    });
}

// ========================================
// Kill the child process
// ========================================
function killWorker(child) {
    if (child) {
        try { child.kill(); } catch (e) { }
    }
}

module.exports = {
    spawnWorker: spawnWorker,
    killWorker: killWorker
};
