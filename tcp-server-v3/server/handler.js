// ========================================
// server/handler.js
// Dispatches incoming messages to the correct action handler
// ========================================

var { getOrCreateClient, openConnection } = require('./client-registry');
var { respond } = require('./protocol');
var { handleRemoteCall } = require('./remote-call');

function handleMessage(socket, message) {
    var requestId = message.requestId;
    var name = message.name;
    var action = message.action;
    var key = message.key;
    var extra = message.extra;

    if (action === 'init') {
        var client = getOrCreateClient(name);
        client.port = parseInt(key);
        // Open persistent connection to this library's local server
        openConnection(client).then(function () {
            respond(socket, requestId, 'ok');
        });
    }

    else if (action === 'set') {
        var client = getOrCreateClient(name);
        client.values[key] = extra;
        respond(socket, requestId, 'ok');
    }

    else if (action === 'get') {
        var client = getOrCreateClient(name);
        respond(socket, requestId, client.values[key] || '');
    }

    else if (action === 'reg') {
        var client = getOrCreateClient(name);
        if (!client.functions.includes(key)) {
            client.functions.push(key);
        }
        respond(socket, requestId, 'ok');
    }

    else if (action === 'call') {
        handleRemoteCall(socket, requestId, key, extra);
    }
}

module.exports = { handleMessage: handleMessage };
