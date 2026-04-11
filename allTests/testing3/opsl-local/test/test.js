// ========================================
// test.js - TCP-enabled library
// Uses tcp-server-v3 client
// ========================================

const TCPClient = require('/home/arptime/Main_Programming/OPSL (Copy 2)/tcp-server-v3/client');

// Define functions
function sayHello() {
    console.log("Hello from function!");
    return "hello executed";
}

var thisString = "56783";
var hellio = "10";
var hellioString = "164380";

// Initialize and register
(async () => {
    await TCPClient.init('test', 4002);
    await TCPClient.registerFunction('sayHello', sayHello);
    await TCPClient.set('thisString', thisString);
    await TCPClient.set('hellio', hellio);
    await TCPClient.set('hellioString', hellioString);
    console.log("test.js loaded and registered");
})();

