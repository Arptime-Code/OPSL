// ========================================
// main.js
// Entry point — run this to execute an .opsl file
// Usage: node runtimeTCP/main.js myscript.opsl
// ========================================

const fs = require('fs');
const { execSync } = require('child_process');
const serverManager = require('./server-manager');
const Runtime = require('./runtime');
const cleanup = require('./cleanup');

var inputFile = process.argv[2];
var tcpServerProcess = null;

// Kill old processes on known ports
function killOldProcesses() {
    var ports = '3000/tcp 4000/tcp 4001/tcp 4002/tcp 4003/tcp 4004/tcp 4005/tcp 4010/tcp 4011/tcp 4020/tcp';
    try {
        execSync('fuser -k ' + ports + ' 2>/dev/null', { stdio: 'pipe' });
    } catch (e) {
        // Ports were already free
    }
}

// Main execution flow
async function main() {
    try {
        // 1. Free up all ports
        killOldProcesses();

        // 2. Start a fresh TCP server (clears all old variables)
        console.log('Starting fresh TCP server...');
        tcpServerProcess = await serverManager.startServer();
        console.log('TCP server started with clean state');

        // 3. Read the .opsl file
        var fileString = fs.readFileSync(inputFile, 'utf8');

        // 4. Create the runtime and execute
        var runtime = new Runtime(inputFile);
        await runtime.processOPSLString(fileString);

        // 5. Clean up all processes and the server
        await cleanup.cleanup(runtime.getGlobalLibraries(), tcpServerProcess);

        console.log('\nOPSL execution completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during OPSL execution:', error);
        process.exit(1);
    }
}

main();
