const net = require('net');

const socket = net.connect(3000);

function send(key, value, callback) {
  socket.write(key + ':' + value);
  socket.once('data', callback);
}

function onWorld() {
  console.log('Done');
}

function onHello() {
  send('world', 'value2', onWorld);
}

send('hello', 'hello', onHello);

// Performance test
var count = 0;
var total = 1000;
var start = Date.now();

function onAck() {
  count++;
  if (count < total) {
    send('key' + count, 'value' + count, onAck);
  } else {
    var elapsed = (Date.now() - start) / 1000;
    console.log((total / elapsed).toFixed(0) + '/sec');
  }
}

send('key0', 'value0', onAck);
