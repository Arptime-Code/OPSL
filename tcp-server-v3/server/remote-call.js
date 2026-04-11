// Call a function registered on another client
// Functions have NO parameters — just name
const net = require('net');
const { getOrCreateClient } = require('./client-registry');
const { respond } = require('./protocol');

function handleRemoteCall(socket, requestId, targetName, fnName) {
    var target = getOrCreateClient(targetName);

    if (!target.functions.includes(fnName) || target.port === 0) {
        respond(socket, requestId, 'fn_not_found');
        return;
    }

    var conn = net.connect(target.port);

    conn.on('connect', function () {
        // Send call with just function name, no arguments
        conn.write('call:' + fnName + '\n');
        conn.end();
    });

    var result = '';
    conn.on('data', function (chunk) { result += chunk; });
    conn.on('end', function () { respond(socket, requestId, result.trim()); });
    conn.on('error', function () { respond(socket, requestId, 'call_error'); });
}

module.exports = { handleRemoteCall: handleRemoteCall };
