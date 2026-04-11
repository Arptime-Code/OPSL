// ========================================
// hello.js - TCP-enabled library
// Uses tcp-server-v3 client
// ========================================

const TCPClient = require('/home/arptime/Main_Programming/OPSL (Copy 2)/tcp-server-v3/client');

// Define functions
function greet() {
    console.log("Hello from greeting! TCP communication is working.");
    return "greet executed";
}

// Initialize and register (async IIFE just for the async calls)
(async () => {
    await TCPClient.init('hello', 4001);
    await TCPClient.registerFunction('greet', greet);
    await TCPClient.set('testVar', 'initial');
    console.log("hello.js loaded and registered");
})();

