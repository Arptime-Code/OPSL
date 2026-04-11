// ========================================
// hello.js - TCP-enabled library
// Uses opsl-tcp-client (globally installed npm package)
// ========================================

var TCPClient = require('opsl-tcp-client');

// Define functions — no parameters allowed
function greet() {
    console.log("Hello from greeting! TCP communication is working.");
    return "greet executed";
}

// Initialize — no port needed, OS assigns one automatically
// Variables set directly, no intermediate local vars
(async () => {
    await TCPClient.init('hello');
    await TCPClient.registerFunction('greet', greet);
    await TCPClient.set('testVar', 'initial');
    console.log("hello.js loaded and registered");
})();
