const { getOrCreateClient } = require('./client-registry');
const { respond } = require('./protocol');
const { handleRemoteCall } = require('./remote-call');

// Dispatch a parsed message to the correct action handler
function handleMessage(socket, message) {
  const { requestId, name, action, key, extra } = message;
  const client = getOrCreateClient(name);

  if (action === 'init') {
    client.port = parseInt(key);
    respond(socket, requestId, 'ok');
  }

  else if (action === 'set') {
    client.values[key] = extra;
    respond(socket, requestId, 'ok');
  }

  else if (action === 'get') {
    respond(socket, requestId, client.values[key] || '');
  }

  else if (action === 'reg') {
    if (!client.functions.includes(key)) {
      client.functions.push(key);
    }
    respond(socket, requestId, 'ok');
  }

  else if (action === 'call') {
    handleRemoteCall(socket, requestId, key, extra);
  }
}

module.exports = { handleMessage };
