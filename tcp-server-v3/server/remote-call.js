// Call a function registered on another client
const net = require('net');
const { getOrCreateClient } = require('./client-registry');
const { respond } = require('./protocol');

function handleRemoteCall(socket, requestId, targetName, fnName) {
  const target = getOrCreateClient(targetName);

  if (!target.functions.includes(fnName) || target.port === 0) {
    respond(socket, requestId, 'fn_not_found');
    return;
  }

  const conn = net.connect(target.port);

  conn.on('connect', function () {
    conn.write('call:' + fnName + '\n');
  });

  let result = '';
  conn.on('data', function (chunk) { result += chunk; });
  conn.on('end', function () { respond(socket, requestId, result.trim()); });
  conn.on('error', function () { respond(socket, requestId, 'call_error'); });
}

module.exports = { handleRemoteCall: handleRemoteCall };
