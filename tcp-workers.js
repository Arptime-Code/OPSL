// ========================================
// tcp-workers.js
// Thin coordinator — delegates to split modules
// ========================================

var tcpSocket = require('./tcp-socket');
var processSpawner = require('./process-spawner');

// Language adapters — add new languages here without touching core code
var languageAdapters = {
    js: require('./languages/js'),
    opsl: require('./languages/opsl')
};

// ========================================
// Create a worker for a library
// ========================================
async function createWorker(language, libraryName, libraryFile) {
    var adapter = languageAdapters[language];
    if (!adapter) {
        console.error('Unknown language: ' + language);
        return null;
    }

    var childProcess = null;

    if (libraryFile) {
        childProcess = await adapter.spawnWorker(libraryName, libraryFile);
    }

    return {
        language: language,
        libraryName: libraryName,
        libraryFile: libraryFile,
        originalLang: (language === 'opsl' ? 'opsl' : null),
        childProcess: childProcess
    };
}

// ========================================
// Worker methods — delegate to tcp-socket
// ========================================

// SET — track response for reliability
function setVariable(worker, name, value) {
    return tcpSocket.sendRequest(worker.libraryName, 'set', name, value);
}

// GET requires a response
function getVariable(worker, name) {
    return tcpSocket.sendRequest(worker.libraryName, 'get', name);
}

// Function call — no parameters
function executeFunction(worker, name) {
    return tcpSocket.sendRequest(worker.libraryName, 'call', worker.libraryName, name);
}

// Kill the library's child process
function closeWorker(worker) {
    if (worker && worker.childProcess) {
        var adapter = languageAdapters[worker.language];
        if (adapter) {
            adapter.killWorker(worker.childProcess);
        }
    }
}

// Close the runtime TCP socket
function closeAll() {
    tcpSocket.closeSocket();
}

module.exports = {
    createWorker: createWorker,
    setVariable: setVariable,
    getVariable: getVariable,
    executeFunction: executeFunction,
    closeWorker: closeWorker,
    closeAll: closeAll
};
