// ========================================
// instruction-handler.js
// Processes each OPSL instruction type
// ========================================

const tcpWorkerLib = require('../tcp-workers');

// Store all imported libraries (shared across the runtime)
var globalLibraries = {};

// ----- IMPORT -----
// Load a library and register it globally
async function handleImport(instruction, runtime) {
    if (runtime.importedLibraries[instruction.library]) {
        return; // Already imported
    }

    console.log('Importing library: ' + instruction.library + ' (' + instruction.lang + ')');

    var worker = await runtime.createWorker(instruction.library, instruction.lang);
    globalLibraries[instruction.library] = worker;
    runtime.importedLibraries[instruction.library] = true;
}

// ----- VARIABLE -----
// Set a variable in a library over TCP
async function handleVariable(instruction, runtime) {
    if (!runtime.importedLibraries[instruction.library]) {
        return;
    }

    var worker = globalLibraries[instruction.library];
    await tcpWorkerLib.setVariable(worker, instruction.name, instruction.value);
}

// ----- ASSIGN -----
// Copy a variable from one library to another over TCP
async function handleAssign(instruction, runtime) {
    if (!runtime.importedLibraries[instruction.library] ||
        !runtime.importedLibraries[instruction.libraryValue]) {
        return;
    }

    var sourceWorker = globalLibraries[instruction.libraryValue];
    var targetWorker = globalLibraries[instruction.library];

    // OPSL libraries don't store variables on TCP
    if (sourceWorker.originalLang === 'opsl') {
        return;
    }

    var value = await tcpWorkerLib.getVariable(sourceWorker, instruction.variableValue);
    await tcpWorkerLib.setVariable(targetWorker, instruction.name, value);
}

// ----- CALL -----
// Execute a function in a library
async function handleCall(instruction, runtime) {
    if (!runtime.importedLibraries[instruction.library]) {
        return;
    }

    var worker = globalLibraries[instruction.library];

    // Dynamic function call: CALL opsl.functionCall
    if (instruction.library === 'opsl' && instruction.name === 'functionCall') {
        var functionString = await tcpWorkerLib.getVariable(worker, 'functionVar');
        if (functionString && functionString.trim()) {
            var parts = functionString.split('.');
            if (parts.length === 2) {
                await runtime.executeOPSLFunction(parts[0], parts[1]);
            }
        }
        return;
    }

    // Console log: CALL opsl.consoleLog
    if (instruction.library === 'opsl' && instruction.name === 'consoleLog') {
        var message = await tcpWorkerLib.getVariable(worker, 'consoleLog');
        console.log(message);
        return;
    }

    // OPSL libraries → execute nested .opsl file
    if (worker.originalLang === 'opsl') {
        await runtime.executeOPSLFunction(instruction.library, instruction.name);
        return;
    }

    // JS libraries → call function via TCP
    await tcpWorkerLib.executeFunction(worker, instruction.name);
}

module.exports = {
    globalLibraries: globalLibraries,
    handleImport: handleImport,
    handleVariable: handleVariable,
    handleAssign: handleAssign,
    handleCall: handleCall
};
