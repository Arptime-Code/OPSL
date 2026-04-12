// ========================================
// tcp-socket.js
// Persistent TCP connection from runtime to main server
// One connection, opened once, reused forever
// ========================================

var net = require('net');
var config = require('./config.json');

var SERVER_PORT = config.server.port;

// Global state — one socket, one buffer
var runtimeSocket = null;
var socketBuffer = '';
var pendingRequests = {};
var nextRequestId = 0;

// ========================================
// Get the socket — creates it once if needed
// ========================================
function getSocket() {
    if (runtimeSocket) {
        return Promise.resolve(runtimeSocket);
    }

    return new Promise(function (resolve, reject) {
        runtimeSocket = net.connect(SERVER_PORT, function () {
            runtimeSocket.setNoDelay(true);
            resolve(runtimeSocket);
        });

        runtimeSocket.on('data', handleIncomingData);
        runtimeSocket.on('error', function (e) {
            runtimeSocket = null;
            reject(e);
        });
    });
}

// ========================================
// Parse incoming TCP data and resolve matching requests
// ========================================
function handleIncomingData(chunk) {
    socketBuffer += chunk.toString();
    var start = 0;
    var newlineIdx;

    while ((newlineIdx = socketBuffer.indexOf('\n', start)) !== -1) {
        if (newlineIdx > start) {
            processLine(start, newlineIdx);
        }
        start = newlineIdx + 1;
    }

    if (start > 0) {
        socketBuffer = socketBuffer.substring(start);
    }
}

// ========================================
// Parse one response line and resolve the matching request
// ========================================
function processLine(start, end) {
    var line = socketBuffer.substring(start, end);
    if (!line.trim()) return;

    var colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;

    var reqId = line.substring(0, colonIdx);
    var data = line.substring(colonIdx + 1);

    if (pendingRequests[reqId]) {
        pendingRequests[reqId](data);
        delete pendingRequests[reqId];
    }
}

// ========================================
// Send a request and wait for response
// ========================================
function sendRequest(name, action, key, value) {
    return new Promise(function (resolve) {
        sendRequestInternal(name, action, key, value, resolve);
    });
}

function sendRequestInternal(name, action, key, value, resolve) {
    getSocket().then(function (socket) {
        var id = String(++nextRequestId);
        pendingRequests[id] = resolve;

        var msg = id + ':' + name + ':' + action + ':' + key;
        if (value !== undefined) {
            msg += ':' + value;
        }
        socket.write(msg + '\n');
    });
}

// ========================================
// Fire-and-forget send — no response tracking
// ========================================
function sendRaw(name, action, key, value) {
    getSocket().then(function (socket) {
        var msg = '0:' + name + ':' + action + ':' + key;
        if (value !== undefined) {
            msg += ':' + value;
        }
        socket.write(msg + '\n');
    });
}

// ========================================
// Close the socket (for cleanup)
// ========================================
function closeSocket() {
    if (runtimeSocket) {
        runtimeSocket.end();
        runtimeSocket = null;
    }
}

module.exports = {
    getSocket: getSocket,
    sendRequest: sendRequest,
    sendRaw: sendRaw,
    closeSocket: closeSocket
};
