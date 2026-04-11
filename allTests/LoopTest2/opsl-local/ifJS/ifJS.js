// ========================================
// ifJS.js - TCP-enabled library
// Uses tcp-server-v3 client
// ========================================

const TCPClient = require('/home/arptime/Main_Programming/OPSL (Copy 2)/tcp-server-v3/client');

let output = "LoopTest.loop";
let trueReturn = "";
let falseReturn = "LoopTest.loop";

let number = "0"

async function ifFunc()
{
    // Get all variables from TCP server
    number = await TCPClient.get('number');
    trueReturn = await TCPClient.get('trueReturn');
    falseReturn = await TCPClient.get('falseReturn');

    //console.log(number);
    if(Number(number) > 100)
    {
        output = trueReturn;
    } else {
        output = falseReturn;
    }

    // Update output on TCP server
    await TCPClient.set('output', output);
}

// Initialize and register
(async () => {
    await TCPClient.init('ifJS', 4011);
    await TCPClient.registerFunction('ifFunc', ifFunc);
    await TCPClient.set('output', output);
    await TCPClient.set('trueReturn', trueReturn);
    await TCPClient.set('falseReturn', falseReturn);
    await TCPClient.set('number', number);
    console.log("ifJS.js loaded and registered");
})();
