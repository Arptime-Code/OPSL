// Store registered clients with persistent connections
// { name: { values: {}, functions: [], port: 0, conn: null, pending: null, buffer: '' } }
const clients = {};
const net = require('net');

function getOrCreateClient(name) {
  if (!clients[name]) {
    clients[name] = { values: {}, functions: [], port: 0, conn: null, pending: null, buffer: '' };
  }
  return clients[name];
}

// Open a persistent connection to a library's local server
function openConnection(client) {
  return new Promise(function (resolve) {
    if (client.conn && !client.conn.destroyed) {
      resolve();
      return;
    }
    if (client.port === 0) {
      resolve();
      return;
    }

    var conn = net.connect(client.port);
    conn.setNoDelay(true);
    client.conn = conn;
    client.buffer = '';

    conn.on('data', function (chunk) {
      client.buffer += chunk.toString();
      var nlIdx = client.buffer.indexOf('\n');
      if (nlIdx !== -1) {
        var result = client.buffer.substring(0, nlIdx);
        client.buffer = '';
        if (client.pending) {
          var cb = client.pending;
          client.pending = null;
          cb(result.trim());
        }
      }
    });

    conn.on('error', function () {
      client.conn = null;
      if (client.pending) {
        var cb = client.pending;
        client.pending = null;
        cb('call_error');
      }
    });

    conn.on('connect', function () {
      resolve();
    });
  });
}

function callFunction(client, fnName, callback) {
  // Hot path: connection already exists, write directly
  if (client.conn && !client.conn.destroyed) {
    client.pending = callback;
    client.buffer = '';
    client.conn.write('call:' + fnName + '\n');
    return;
  }
  // First call — need to open connection first
  openConnection(client).then(function () {
    if (!client.conn || client.conn.destroyed) {
      callback('call_error');
      return;
    }
    client.pending = callback;
    client.buffer = '';
    client.conn.write('call:' + fnName + '\n');
  });
}

module.exports = { getOrCreateClient: getOrCreateClient, openConnection: openConnection, callFunction: callFunction };
