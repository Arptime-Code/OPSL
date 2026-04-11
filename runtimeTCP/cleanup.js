// ========================================
// cleanup.js
// Kills library processes and stops the TCP server
// ========================================

const tcpWorkerLib = require('../tcp-workers');
const serverManager = require('./server-manager');

// Shut down everything cleanly
async function cleanup(globalLibraries, tcpServerProcess) {
    // Kill all library child processes
    for (var key in globalLibraries) {
        try {
            tcpWorkerLib.closeWorker(globalLibraries[key]);
        } catch (e) {
            // Process already exited
        }
    }

    // Stop the TCP server
    serverManager.stopServer(tcpServerProcess);
    console.log('TCP server stopped');
}

module.exports = {
    cleanup: cleanup
};
