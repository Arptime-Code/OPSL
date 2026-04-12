// ========================================
// server/remote-call.js
// Routes function calls between clients
// Uses PERSISTENT connections — no new connection per call
// ========================================

var { getOrCreateClient, callFunction } = require('./client-registry');
var { respond } = require('./protocol');

function handleRemoteCall(socket, requestId, targetName, fnName) {
    var target = getOrCreateClient(targetName);

    if (!target.functions.includes(fnName) || target.port === 0) {
        respond(socket, requestId, 'fn_not_found');
        return;
    }

    // Reuse persistent connection
    callFunction(target, fnName, function (result) {
        respond(socket, requestId, result);
    });
}

module.exports = { handleRemoteCall: handleRemoteCall };
