// ========================================
// greeting.js - TCP-enabled library
// Uses tcp-server-v3 client
// ========================================

const TCPClient = require('/home/arptime/Main_Programming/OPSL (Copy 2)/tcp-server-v3/client');

// Define functions
function showMessage() {
    console.log("Greeting function executed!");
    return "message shown";
}

// Initialize and register
(async () => {
    await TCPClient.init('greeting', 4003);
    await TCPClient.registerFunction('showMessage', showMessage);
    console.log("greeting.js loaded and registered");
})();

