// ========================================
// process-spawner.js
// Manages tracked child processes for cleanup
// ========================================

var managedProcesses = [];

// Register a process for tracked cleanup
function trackProcess(child) {
    managedProcesses.push(child);
    return child;
}

// Kill all tracked processes
function killAll() {
    managedProcesses.forEach(function (proc) {
        try { proc.kill('SIGTERM'); } catch (e) { }
    });
    managedProcesses = [];
}

module.exports = {
    trackProcess: trackProcess,
    killAll: killAll
};
