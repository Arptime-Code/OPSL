// Dispatch a parsed message to the correct action handler
const { getOrCreateClient } = require('./client-registry');
const { respond } = require('./protocol');
const { handleRemoteCall } = require('./remote-call');

function handleMessage(socket, message) {
    var requestId = message.requestId;
    var name = message.name;
    var action = message.action;
    var key = message.key;
    var extra = message.extra;
    var client = getOrCreateClient(name);

    if (action === 'init') {
        client.port = parseInt(key);
        respond(socket, requestId, 'ok');
    }

    else if (action === 'set') {
        client.values[key] = extra;
        respond(socket, requestId, 'ok');
    }

    else if (action === 'get') {
        respond(socket, requestId, client.values[key] || '');
    }

    else if (action === 'reg') {
        if (!client.functions.includes(key)) {
            client.functions.push(key);
        }
        respond(socket, requestId, 'ok');
    }

    else if (action === 'call') {
        // key = target library name, extra = function name (no args)
        handleRemoteCall(socket, requestId, key, extra);
    }
}

module.exports = { handleMessage: handleMessage };
