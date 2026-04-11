// Local TCP server for receiving function calls from other clients
const net = require('net');

function startLocalServer(port, getFunction) {
  const server = net.createServer(socket => {
    let data = '';
    socket.on('data', chunk => { data += chunk.toString(); });
    socket.on('end', () => {
      handleIncomingCall(socket, data.trim(), getFunction);
    });
    socket.on('error', () => {});
  });

  server.listen(port);
}

function handleIncomingCall(socket, rawMessage, getFunction) {
  const parts = rawMessage.split(':');
  // Format: call:functionName:args
  if (parts[0] !== 'call') return;

  const fnName = parts[1];
  const fn = getFunction(fnName);
  if (!fn) return;

  const args = parts[2] ? parts[2].split(',') : [];
  const result = fn(...args);
  socket.write(result + '\n');
  socket.end();
}

module.exports = { startLocalServer };
