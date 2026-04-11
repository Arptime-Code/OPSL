const net = require('net');
const { getOrCreateClient } = require('./client-registry');
const { respond } = require('./protocol');

// Call a function registered on another client
function handleRemoteCall(socket, requestId, targetName, callData) {
  const [fnName, args] = callData.split(':');
  const target = getOrCreateClient(targetName);

  if (!target.functions.includes(fnName) || target.port === 0) {
    respond(socket, requestId, 'fn_not_found');
    return;
  }

  const conn = net.connect(target.port);

  conn.on('connect', () => {
    conn.write('call:' + fnName + ':' + args + '\n');
    conn.end();
  });

  let result = '';
  conn.on('data', chunk => { result += chunk; });
  conn.on('end', () => respond(socket, requestId, result.trim()));
  conn.on('error', () => respond(socket, requestId, 'call_error'));
}

module.exports = { handleRemoteCall };
