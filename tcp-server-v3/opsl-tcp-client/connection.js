// Persistent TCP connection to the main server
const net = require('net');

let serverSocket = null;

function connectToServer(onData) {
  return new Promise(resolve => {
    serverSocket = net.connect(3000, resolve);

    serverSocket.on('data', onData);
    serverSocket.on('error', () => { serverSocket = null; });
    serverSocket.on('end', () => { serverSocket = null; });
  });
}

function sendRaw(message) {
  if (!serverSocket) {
    throw new Error('Not connected to server');
  }
  serverSocket.write(message + '\n');
}

function isConnected() {
  return serverSocket !== null;
}

module.exports = { connectToServer, sendRaw, isConnected };
