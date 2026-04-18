// ========================================
// runtime.js
// The Runtime class — ties all modules together
// ========================================

var path = require('path');
var parser = require('../parser');
var libraryLoader = require('./library-loader');
var instructionHandler = require('./instruction-handler');
var opslExecutor = require('./opsl-executor');

// Shared state
var globalLibraries = instructionHandler.globalLibraries;

function Runtime(baseFilePath) {
    this.baseFilePath = baseFilePath;
    this.importedLibraries = {};
}

Runtime.prototype.getBaseDir = function () {
    return path.dirname(this.baseFilePath);
};

Runtime.prototype.createWorker = function (libraryName, language) {
    return libraryLoader.loadLibrary(this.baseFilePath, libraryName, language);
};

// Walk through every line of the .opsl file and execute it
Runtime.prototype.processOPSLString = async function (fileString) {
    var lines = fileString.split('\n');
    var self = this;

    for (var i = 0; i < lines.length; i++) {
        var instruction = parser.parseLine(lines[i]);

        switch (instruction.type) {
            case 'IMPORT':
                if (!self.importedLibraries[instruction.library]) {
                    console.log('Importing library: ' + instruction.library + ' (' + instruction.lang + ')');
                    var worker = await self.createWorker(instruction.library, instruction.lang);
                    globalLibraries[instruction.library] = worker;
                    self.importedLibraries[instruction.library] = true;
                }
                break;

            case 'VARIABLE':
                if (self.importedLibraries[instruction.library]) {
                    var w = globalLibraries[instruction.library];
                    await instructionHandler.setVariable(w, instruction.name, instruction.value);
                }
                break;

            case 'ASSIGN':
                if (self.importedLibraries[instruction.library] && self.importedLibraries[instruction.libraryValue]) {
                    var src = globalLibraries[instruction.libraryValue];
                    var tgt = globalLibraries[instruction.library];
                    var val = await instructionHandler.getVariable(src, instruction.variableValue);
                    await instructionHandler.setVariable(tgt, instruction.name, val);
                }
                break;

            case 'CALL':
                if (self.importedLibraries[instruction.library]) {
                    await self.handleCall(instruction);
                }
                break;
        }
    }
};

// Handle CALL instruction inline
Runtime.prototype.handleCall = async function (instruction) {
    var worker = globalLibraries[instruction.library];

    // Special: dynamic function call
    if (instruction.library === 'opsl' && instruction.name === 'functionCall') {
        var functionString = await instructionHandler.getVariable(worker, 'functionVar');
        if (functionString && functionString.trim()) {
            var parts = functionString.split('.');
            if (parts.length === 2) {
                await this.executeOPSLFunction(parts[0], parts[1]);
            }
        }
        return;
    }

    // Special: console log
    if (instruction.library === 'opsl' && instruction.name === 'consoleLog') {
        var message = await instructionHandler.getVariable(worker, 'consoleLog');
        console.log(message);
        return;
    }

    // OPSL → nested .opsl; JS → TCP function call
    if (worker.originalLang === 'opsl') {
        await this.executeOPSLFunction(instruction.library, instruction.name);
    } else {
        await instructionHandler.executeFunction(worker, instruction.name);
    }
};

Runtime.prototype.executeOPSLFunction = function (library, name) {
    return opslExecutor.executeOPSLFunction(this, library, name);
};

Runtime.prototype.getGlobalLibraries = function () {
    return globalLibraries;
};

module.exports = Runtime;
