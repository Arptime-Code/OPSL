// ========================================
// ifJS.js - TCP-enabled library
// Uses opsl-tcp-client (globally installed npm package)
// ========================================

var TCPClient = require('opsl-tcp-client');

// Functions have NO parameters — read everything from TCP server
async function ifFunc() {
    var number = await TCPClient.get('number');
    var trueReturn = await TCPClient.get('trueReturn');
    var falseReturn = await TCPClient.get('falseReturn');

    //console.log(number);
    var output;
    if (Number(number) > 10000) {
        output = trueReturn;
    } else {
        output = falseReturn;
    }

    await TCPClient.set('output', output);
}

// Initialize — OS assigns port automatically
// Variables set directly, no intermediate local vars
(async () => {
    await TCPClient.init('ifJS');
    await TCPClient.registerFunction('ifFunc', ifFunc);
    await TCPClient.set('output', 'LoopTest.loop');
    await TCPClient.set('trueReturn', '');
    await TCPClient.set('falseReturn', 'LoopTest.loop');
    await TCPClient.set('number', '0');
    console.log("ifJS.js loaded and registered");
})();
