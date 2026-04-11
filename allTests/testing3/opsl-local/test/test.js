// ========================================
// test.js - TCP-enabled library
// Uses opsl-tcp-client (globally installed npm package)
// ========================================

var TCPClient = require('opsl-tcp-client');

// Functions — no parameters
function sayHello() {
    console.log("Hello from function!");
    return "hello executed";
}

// Initialize — OS assigns port automatically
(async () => {
    await TCPClient.init('test');
    await TCPClient.registerFunction('sayHello', sayHello);
    await TCPClient.set('thisString', '56783');
    await TCPClient.set('hellio', '10');
    await TCPClient.set('hellioString', '164380');
    console.log("test.js loaded and registered");
})();
