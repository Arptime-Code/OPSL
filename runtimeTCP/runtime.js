// ========================================
// runtime.js
// The Runtime class — ties all modules together
// ========================================

const path = require('path');
const parser = require('../parser');
const libraryLoader = require('./library-loader');
const instructionHandler = require('./instruction-handler');
const opslExecutor = require('./opsl-executor');

// Shared state (used by instruction-handler and cleanup)
var globalLibraries = instructionHandler.globalLibraries;

function Runtime(baseFilePath) {
    this.baseFilePath = baseFilePath;
    this.importedLibraries = {};
}

// Get directory of the current .opsl file
Runtime.prototype.getBaseDir = function () {
    return path.dirname(this.baseFilePath);
};

// Create a worker for a library (delegated to library-loader)
Runtime.prototype.createWorker = function (libraryName, language) {
    return libraryLoader.loadLibrary(this.baseFilePath, libraryName, language);
};

// Walk through every line of the .opsl file and execute it
Runtime.prototype.processOPSLString = async function (fileString) {
    var lines = fileString.split('\n');

    for (var i = 0; i < lines.length; i++) {
        var instruction = parser.parseLine(lines[i]);

        switch (instruction.type) {
            case 'IMPORT':
                await instructionHandler.handleImport(instruction, this);
                break;
            case 'VARIABLE':
                await instructionHandler.handleVariable(instruction, this);
                break;
            case 'ASSIGN':
                await instructionHandler.handleAssign(instruction, this);
                break;
            case 'CALL':
                await instructionHandler.handleCall(instruction, this);
                break;
        }
    }
};

// Execute a nested .opsl file (delegated to opsl-executor)
Runtime.prototype.executeOPSLFunction = function (library, name) {
    return opslExecutor.executeOPSLFunction(this, library, name);
};

// Expose global libraries for cleanup
Runtime.prototype.getGlobalLibraries = function () {
    return globalLibraries;
};

module.exports = Runtime;
