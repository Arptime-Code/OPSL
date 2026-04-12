const net = require('net');
const { createParser } = require('./parser');
const { handleMessage } = require('./handler');

// Start the main server
const server = net.createServer(socket => {
  socket.setNoDelay(true);
  const onData = createParser(message => {
    handleMessage(socket, message);
  });

  socket.on('data', onData);
  socket.on('error', () => {});
});

server.listen(3000, () => console.log('Server on 3000'));
