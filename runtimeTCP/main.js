// ========================================
// main.js
// Entry point — run this to execute an .opsl file
// Usage: node runtimeTCP/main.js myscript.opsl
// ========================================

var fs = require('fs');
var { spawn } = require('child_process');
var serverManager = require('./server-manager');
var Runtime = require('./runtime');
var tcpWorkerLib = require('../tcp-workers');

var inputFile = process.argv[2];
var tcpServerProcess = null;

// ========================================
// Main execution flow
// ========================================
async function main() {
    try {
        // 1. Start a fresh TCP server (clears all old variables)
        console.log('Starting fresh TCP server...');
        tcpServerProcess = await serverManager.startServer();
        console.log('TCP server started with clean state');

        // 2. Read the .opsl file
        var fileString = fs.readFileSync(inputFile, 'utf8');

        // 3. Create the runtime and execute
        var runtime = new Runtime(inputFile);
        await runtime.processOPSLString(fileString);

        // 4. Clean up all processes and the server
        await cleanup(runtime.getGlobalLibraries(), tcpServerProcess);

        console.log('\nOPSL execution completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during OPSL execution:', error);
        await cleanupAll(tcpServerProcess);
        process.exit(1);
    }
}

// ========================================
// Graceful shutdown
// ========================================
async function cleanup(globalLibs, serverProc) {
    for (var key in globalLibs) {
        try { tcpWorkerLib.closeWorker(globalLibs[key]); } catch (e) { }
    }
    tcpWorkerLib.closeAll();
    serverManager.stopServer(serverProc);
    console.log('TCP server stopped');
}

async function cleanupAll(serverProc) {
    tcpWorkerLib.closeAll();
    serverManager.stopServer(serverProc);
}

process.on('SIGINT', function () { cleanupAll(tcpServerProcess); process.exit(0); });
process.on('SIGTERM', function () { cleanupAll(tcpServerProcess); process.exit(0); });

main();
