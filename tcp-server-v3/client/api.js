// Public API — thin wrappers over the protocol layer
const { connectToServer, isConnected } = require('./connection');
const { drainResponses } = require('./responses');
const { send } = require('./protocol');
const { startLocalServer } = require('./local-server');

// Shared state
let clientName = '';
let functions = {};

async function init(name, port) {
  clientName = name;

  // Start local server to receive function calls from other clients
  startLocalServer(port, fnName => functions[fnName]);

  // Connect to main server if needed
  if (!isConnected()) {
    await connectToServer(drainResponses);
  }

  return send(name, 'init', String(port));
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
