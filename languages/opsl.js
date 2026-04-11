// ========================================
// languages/opsl.js
// Language adapter for OPSL libraries
// OPSL libraries don't spawn processes — they execute as nested .opsl files
// ========================================

function spawnWorker(libraryName, libraryFile) {
    // OPSL libraries don't spawn child processes
    // Return null to signal that this is a nested-execution library
    return Promise.resolve(null);
}

function killWorker(child) {
    // No child process to kill for OPSL libraries
}

module.exports = {
    spawnWorker: spawnWorker,
    killWorker: killWorker
};
