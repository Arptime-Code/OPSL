// ========================================
// instruction-handler.js
// Helper functions for variable/function operations
// ========================================

var tcpWorkerLib = require('../tcp-workers');

// Store all imported libraries (shared with runtime)
var globalLibraries = {};

function setVariable(worker, name, value) {
    return tcpWorkerLib.setVariable(worker, name, value);
}

function getVariable(worker, name) {
    return tcpWorkerLib.getVariable(worker, name);
}

function executeFunction(worker, name) {
    return tcpWorkerLib.executeFunction(worker, name);
}

module.exports = {
    globalLibraries: globalLibraries,
    setVariable: setVariable,
    getVariable: getVariable,
    executeFunction: executeFunction
};
