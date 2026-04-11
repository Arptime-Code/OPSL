// Send a response back to the connected client
function respond(socket, requestId, data) {
  socket.write(requestId + ':' + data + '\n');
}

module.exports = { respond };
