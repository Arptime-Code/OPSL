// ========================================
// greeting.js - TCP-enabled library
// Uses opsl-tcp-client (globally installed npm package)
// ========================================

var TCPClient = require('opsl-tcp-client');

// Functions — no parameters
function showMessage() {
    console.log("Greeting function executed!");
    return "message shown";
}

// Initialize — OS assigns port automatically
(async () => {
    await TCPClient.init('greeting');
    await TCPClient.registerFunction('showMessage', showMessage);
    console.log("greeting.js loaded and registered");
})();
