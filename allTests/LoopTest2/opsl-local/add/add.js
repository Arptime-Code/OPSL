// ========================================
// add.js - TCP-enabled library
// Uses tcp-server-v3 client
// ========================================

const TCPClient = require('/home/arptime/Main_Programming/OPSL (Copy 2)/tcp-server-v3/client');

let number = "0"
let output = "0"

async function add() {
    // Get current number from TCP server
    number = await TCPClient.get('number');
    number = String(Number(number) + 1)
    output = number
    
    // Update variables on TCP server so they're globally accessible
    await TCPClient.set('number', number);
    await TCPClient.set('output', output);
}

// Initialize and register
(async () => {
    await TCPClient.init('add', 4010);
    await TCPClient.registerFunction('add', add);
    await TCPClient.set('number', number);
    await TCPClient.set('output', output);
    console.log("add.js loaded and registered");
})();
