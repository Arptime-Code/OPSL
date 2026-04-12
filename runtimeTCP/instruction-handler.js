// ========================================
// instruction-handler.js
// Helper functions for variable/function operations
// ========================================

var tcpWorkerLib = require('../tcp-workers');

// Store all imported libraries (shared with runtime)
var globalLibraries = {};

// Local in-memory storage for 'opsl' native library variables
var opslLocalVars = {};

function setVariable(worker, name, value) {
    // OPSL library stores locally since it has no TCP connection
    if (worker.originalLang === 'opsl') {
        opslLocalVars[name] = value;
        return Promise.resolve();
    }
    return tcpWorkerLib.setVariable(worker, name, value);
}

function getVariable(worker, name) {
    // OPSL library reads from local memory
    if (worker.originalLang === 'opsl') {
        return Promise.resolve(opslLocalVars[name] || '');
    }
    return tcpWorkerLib.getVariable(worker, name);
}

function executeFunction(worker, name) {
    return tcpWorkerLib.executeFunction(worker, name);
}

module.exports = {
    globalLibraries: globalLibraries,
    opslLocalVars: opslLocalVars,
    setVariable: setVariable,
    getVariable: getVariable,
    executeFunction: executeFunction
};
