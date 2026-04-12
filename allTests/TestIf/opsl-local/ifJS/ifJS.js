const TCPClient = require('opsl-tcp-client');

async function ifFunction()
{
    let numberGreater = await TCPClient.get('ifNumberGreater');
    let numberSmaller = await TCPClient.get('ifNumberSmaller');
    let trueOutput = await TCPClient.get('ifTrueOutput');
    let falseOutput = await TCPClient.get('ifFalseOutput');
    let ifOutput = "null";

    // TCP sends strings, so we must convert to numbers for correct comparison
    if(Number(numberGreater) > Number(numberSmaller))
    {
        ifOutput = trueOutput;
    } else {
        ifOutput = falseOutput;
    }

    await TCPClient.set('ifOutput', ifOutput);
}

(async () => {
    // Must match the library name used in IMPORT [js] ifJS
    await TCPClient.init('ifJS');
    // Required so OPSL can actually call this function
    await TCPClient.registerFunction('ifFunction', ifFunction);
    console.log("loaded and registered");
})();
