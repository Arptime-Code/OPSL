// ========================================
// add.js - TCP-enabled library
// Uses opsl-tcp-client (globally installed npm package)
// ========================================

var TCPClient = require('opsl-tcp-client');

// Functions have NO parameters — just execute and return
async function add() {
    var number = await TCPClient.get('number');
    number = String(Number(number) + 1);
    await TCPClient.set('number', number);
    await TCPClient.set('output', number);
    return number;
}

// Initialize — OS assigns port automatically
(async () => {
    await TCPClient.init('add');
    await TCPClient.registerFunction('add', add);
    await TCPClient.set('number', '0');
    await TCPClient.set('output', '0');
    console.log("add.js loaded and registered");
})();
