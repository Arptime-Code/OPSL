// Public API — thin wrappers over the protocol layer
const { connectToServer, isConnected } = require('./connection');
const { drainResponses } = require('./responses');
const { send } = require('./protocol');
const { startLocalServer } = require('./local-server');

// Shared state
var clientName = '';
var functions = {};
var localServer = null;
var assignedPort = null;

async function init(name) {
    clientName = name;

    // Start local server with port 0 — OS assigns a free port automatically
    localServer = startLocalServer(0, function (fnName) {
        return functions[fnName];
    });

    // Wait for the server to be listening and get the assigned port
    assignedPort = await waitForPort(localServer);

    // Connect to main server if needed
    if (!isConnected()) {
        await connectToServer(drainResponses);
    }

    // Register with the main server using the auto-assigned port
    return send(name, 'init', String(assignedPort));
}

// Helper: wait for the local server to get an assigned port
function waitForPort(server) {
    return new Promise(function (resolve) {
        function check() {
            var addr = server.address();
            if (addr && addr.port) {
                resolve(addr.port);
            } else {
                setTimeout(check, 10);
            }
        }
        check();
    });
}

function set(key, value) {
    return send(clientName, 'set', key, value);
}

function get(key) {
    return send(clientName, 'get', key);
}

function registerFunction(name, fn) {
    functions[name] = fn;
    return send(clientName, 'reg', name);
}

// No parameters — just call the function by name
function callRemote(target, fnName) {
    var callData = fnName;
    return send(clientName, 'call', target, callData);
}

// Expose assigned port for debugging
function getPort() {
    return assignedPort;
}

module.exports = { init: init, set: set, get: get, registerFunction: registerFunction, callRemote: callRemote, getPort: getPort };
