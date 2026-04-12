const net = require('net');
const { createParser } = require('./parser');
const { handleMessage } = require('./handler');

// Start the main server
const server = net.createServer(function (socket) {
  socket.setNoDelay(true);
  const onData = createParser(function (message) {
    handleMessage(socket, message);
  });

  socket.on('data', onData);
  socket.on('error', function () {});
});

server.listen(3000, function () { console.log('Server on 3000'); });
