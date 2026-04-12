// ========================================
// client/local-server.js
// Local TCP server for receiving function calls from other clients
// Uses newline-delimited messages — no need to wait for connection end
// ========================================

const net = require('net');

function startLocalServer(port, getFunction) {
  const server = net.createServer(function (socket) {
    let buffer = '';
    socket.on('data', function (chunk) {
      buffer += chunk.toString();
      var nlIdx = buffer.indexOf('\n');
      while (nlIdx !== -1) {
        var msg = buffer.substring(0, nlIdx).trim();
        buffer = buffer.substring(nlIdx + 1);
        handleIncomingCall(socket, msg, getFunction);
        nlIdx = buffer.indexOf('\n');
      }
    });
    socket.on('error', function () { });
  });

  server.listen(port || 0);
  return server;
}

function handleIncomingCall(socket, rawMessage, getFunction) {
  const parts = rawMessage.split(':');
  if (parts[0] !== 'call') return;

  const fnName = parts[1];
  const fn = getFunction(fnName);
  if (!fn) return;

  const result = fn();
  if (result && typeof result.then === 'function') {
    result.then(function (resolved) {
      socket.write(resolved + '\n');
      socket.end();
    }).catch(function () {
      socket.write('error\n');
      socket.end();
    });
  } else {
    socket.write(result + '\n');
    socket.end();
  }
}

module.exports = { startLocalServer: startLocalServer };
