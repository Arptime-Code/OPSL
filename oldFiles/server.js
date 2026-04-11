const net = require('net');
const store = {};

const server = net.createServer(socket => {
  socket.on('data', data => {
    const [key, value] = data.toString().split(':');
    store[key] = value;
    socket.write('ok');
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
