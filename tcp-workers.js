// ========================================
// TCP Workers for OPSL
// Each library gets ONE persistent TCP socket to server
// ========================================

const { spawn, execSync } = require('child_process');
const net = require('net');

// ========================================
// Configuration values — change these if needed
// ========================================
var SERVER_PORT = 3000;
var START_PORT = 4000;
var READY_TIMEOUT = 5000;
var READY_MARKER = 'loaded and registered';

// ========================================
// Persistent TCP socket state
// ========================================
var runtimeSocket = null;
var socketBuffer = '';
var pendingRequests = {};
var nextRequestId = 0;

// ========================================
// Socket creation — called once, reused forever
// ========================================
function getRuntimeSocket() {
    if (runtimeSocket) {
        return Promise.resolve(runtimeSocket);
    }

    return new Promise(function (resolve, reject) {
        runtimeSocket = net.connect(SERVER_PORT, function () {
            resolve(runtimeSocket);
        });

        runtimeSocket.on('data', handleIncomingData);
        runtimeSocket.on('error', handleSocketError);
    });
}

// ========================================
// Parse incoming TCP data and resolve matching requests
// ========================================
function handleIncomingData(chunk) {
    socketBuffer += chunk.toString();
    var completeLines = getCompleteLines();

    for (var i = 0; i < completeLines.length; i++) {
        var line = completeLines[i];
        processResponseLine(line);
    }
}

// Split buffer on newlines, keep incomplete part in buffer
function getCompleteLines() {
    var lines = socketBuffer.split('\n');
    socketBuffer = lines.pop() || '';
    return lines;
}

// Parse one response line and resolve the matching request
function processResponseLine(line) {
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

// Reset socket on error so next call creates a fresh one
function handleSocketError(err) {
    runtimeSocket = null;
    console.error('[TCP] Socket error:', err.message);
}

// ========================================
// Send a request and wait for response
// ========================================
function sendRuntimeRequest(name, action, key, value) {
    return new Promise(function (resolve) {
        sendRequestInternal(name, action, key, value, resolve);
    });
}

function sendRequestInternal(name, action, key, value, resolve) {
    getRuntimeSocket().then(function (socket) {
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
// Worker creation — spawns a JS library as a node process
// ========================================
var nextPort = START_PORT;

function createWorker(language, libraryName, libraryFile) {
    var port = nextPort++;

    var worker = {
        language: language,
        libraryName: libraryName,
        libraryFile: libraryFile,
        port: port,
        originalLang: null,
        childProcess: null
    };

    if (language === 'opsl') {
        worker.originalLang = 'opsl';
    }

    if (language === 'js' && libraryFile) {
        return createJSWorker(worker);
    }

    return Promise.resolve(worker);
}

// Kill old process on this port, spawn the library, wait for ready
function createJSWorker(worker) {
    killProcessOnPort(worker.port);

    worker.childProcess = spawn('node', [worker.libraryFile], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    setupWorkerOutput(worker);

    // Wait for ready marker or timeout
    return new Promise(function (resolve) {
        var readyPromise = new Promise(function (res) {
            worker.onReady = res;
        });

        var timeoutPromise = new Promise(function (res) {
            setTimeout(res, READY_TIMEOUT);
        });

        Promise.race([readyPromise, timeoutPromise]).then(function () {
            resolve(worker);
        });
    });
}

// Kill whatever is using this TCP port
function killProcessOnPort(port) {
    try {
        execSync('fuser -k ' + port + '/tcp 2>/dev/null', { stdio: 'pipe' });
    } catch (e) {
        // Port was already free — that's fine
    }
}

// Listen to stdout/stderr and detect ready marker
function setupWorkerOutput(worker) {
    var buffer = '';

    worker.childProcess.stdout.on('data', function (data) {
        buffer += data.toString();
        console.log('[' + worker.libraryName + '] ' + data.toString().trim());

        if (buffer.indexOf(READY_MARKER) !== -1 && worker.onReady) {
            worker.onReady();
            worker.onReady = null;
        }
    });

    worker.childProcess.stderr.on('data', function (data) {
        console.error('[' + worker.libraryName + ' error] ' + data.toString().trim());
    });
}

// ========================================
// Public worker methods
// ========================================
function setVariable(worker, name, value) {
    return sendRuntimeRequest(worker.libraryName, 'set', name, value);
}

function getVariable(worker, name) {
    return sendRuntimeRequest(worker.libraryName, 'get', name);
}

function executeFunction(worker, name) {
    return sendRuntimeRequest(worker.libraryName, 'call', worker.libraryName, name + ':');
}

function closeWorker(worker) {
    if (worker.childProcess) {
        worker.childProcess.kill();
    }
}

// ========================================
// Exports
// ========================================
module.exports = {
    createWorker: createWorker,
    setVariable: setVariable,
    getVariable: getVariable,
    executeFunction: executeFunction,
    closeWorker: closeWorker
};
