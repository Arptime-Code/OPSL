// Build and send request messages to the server
const { sendRaw } = require('./connection');
const { registerRequest } = require('./responses');

let nextRequestId = 0;

function send(name, action, key, value) {
  const id = String(++nextRequestId);
  const promise = registerRequest(id);

  let msg = id + ':' + name + ':' + action + ':' + key;
  if (value !== undefined) msg += ':' + value;
  sendRaw(msg);

  return promise;
}

module.exports = { send };
