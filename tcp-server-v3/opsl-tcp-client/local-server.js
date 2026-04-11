// Local TCP server for receiving function calls from other clients
// Functions are called with NO parameters — just execute and return
const net = require('net');

function startLocalServer(port, getFunction) {
    var server = net.createServer(function (socket) {
        var data = '';
        socket.on('data', function (chunk) {
            data += chunk.toString();
        });
        socket.on('end', function () {
            handleIncomingCall(socket, data.trim(), getFunction);
        });
        socket.on('error', function () { });
    });

    // Use port 0 to let OS assign a free port automatically
    server.listen(port || 0);
    return server;
}

function handleIncomingCall(socket, rawMessage, getFunction) {
    var parts = rawMessage.split(':');
    // Format: call:functionName (no arguments)
    if (parts[0] !== 'call') return;

    var fnName = parts[1];
    var fn = getFunction(fnName);
    if (!fn) return;

    // Execute with no parameters
    var result = fn();
    socket.write(String(result) + '\n');
    socket.end();
}

module.exports = { startLocalServer: startLocalServer };
