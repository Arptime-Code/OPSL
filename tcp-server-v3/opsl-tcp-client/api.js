// Public API — thin wrappers over the protocol layer
const { connectToServer, isConnected } = require('./connection');
const { drainResponses } = require('./responses');
const { send } = require('./protocol');
const { startLocalServer } = require('./local-server');

// Shared state
let clientName = '';
let functions = {};
let localServer = null;

async function init(name, port) {
    clientName = name;

    // Start local server to receive function calls from other clients
    localServer = startLocalServer(port, fnName => functions[fnName]);

    // Wait for the server to get a port (supports auto-assignment with port 0)
    let actualPort = port || 0;
    if (actualPort === 0) {
        actualPort = await waitForPort(localServer);
    }

    // Connect to main server if needed
    if (!isConnected()) {
        await connectToServer(drainResponses);
    }

    return send(name, 'init', String(actualPort));
}

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

function callRemote(target, fn, ...args) {
    const callData = fn + ':' + args.join(',');
    return send(clientName, 'call', target, callData);
}

module.exports = { init, set, get, registerFunction, callRemote };
