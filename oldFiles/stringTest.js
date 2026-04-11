const net = require('net');

const server = net.createServer(socket => {
  let count = 0;
  socket.on('data', () => {
    count++;
    if (count % 100000 === 0) console.log(`Received ${count}`);
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));

function sendString(str) {
  const socket = net.connect(3000, () => socket.write(str));
}

const str = 'x'.repeat(100);
const COUNT = 1000;
let sent = 0;
const start = Date.now();

function send() {
  sendString(str);
  sent++;
  if (sent < COUNT) {
    send();
  } else {
    const elapsed = (Date.now() - start) / 1000;
    console.log(`Sent ${COUNT} strings in ${elapsed.toFixed(2)}s`);
    console.log(`Rate: ${(COUNT / elapsed).toFixed(0)} strings/sec`);
    process.exit(0);
  }
}

send();
