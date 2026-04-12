// ========================================
// client/local-server.js
// Local TCP server for receiving function calls from other clients
// Keeps connections open for reuse (connection pooling)
// ========================================

var net = require('net');

function startLocalServer(port, getFunction) {
    var server = net.createServer(function (socket) {
        socket.setNoDelay(true);
        var data = '';
        socket.on('data', function (chunk) {
            data += chunk.toString();
            // Process complete messages (newline-delimited)
            var nlIdx = data.indexOf('\n');
            while (nlIdx !== -1) {
                var msg = data.substring(0, nlIdx);
                data = data.substring(nlIdx + 1);
                handleIncomingCall(socket, msg.trim(), getFunction);
                nlIdx = data.indexOf('\n');
            }
        });
        socket.on('end', function () {
            // Connection closed by client — clean shutdown
        });
        socket.on('error', function () { });
    });

    server.listen(port || 0);
    return server;
}

function handleIncomingCall(socket, rawMessage, getFunction) {
    var parts = rawMessage.split(':');
    if (parts[0] !== 'call') return;

    var fnName = parts[1];
    var fn = getFunction(fnName);
    if (!fn) return;

    var result = fn();
    // Write result + newline — DON'T end the socket, keep it open for next call
    socket.write(result + '\n');
}

module.exports = { startLocalServer: startLocalServer };
