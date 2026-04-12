// ========================================
// client/protocol.js
// Build and send request messages to the server
// ========================================

var { sendRaw } = require('./connection');
var { registerRequest } = require('./responses');

var nextRequestId = 0;

function send(name, action, key, value) {
  var id = String(++nextRequestId);
  var promise = registerRequest(id);

  var msg = id + ':' + name + ':' + action + ':' + key;
  if (value !== undefined) msg += ':' + value;
  sendRaw(msg);

  return promise;
}

module.exports = { send: send };
