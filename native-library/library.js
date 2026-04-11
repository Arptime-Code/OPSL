// ========================================
// native-library/library.js
// Dynamic function dispatch — parses "library.functionName" strings
// ========================================

// Configuration: separator between library and function name
var FUNCTION_SEPARATOR = '.';

// ========================================
// Parse the function string and route execution
// ========================================
async function callFunction(functionString, globalLibraries, importedLibraries, executeOPSLFunction) {
    var parts = parseFunctionString(functionString);
    var libraryName = parts.libraryName;
    var functionName = parts.functionName;

    // Check that the library is imported
    if (!importedLibraries[libraryName]) {
        return;
    }

    // Get the worker for this library
    var worker = globalLibraries[libraryName];
    if (!worker) {
        return;
    }

    // Route based on library type
    if (worker.originalLang === 'opsl') {
        await executeOPSLFunction(libraryName, functionName);
    } else {
        callTCPFunction(worker, libraryName, functionName);
    }
}

// ========================================
// Split "library.functionName" into parts
// ========================================
function parseFunctionString(functionString) {
    var parts = functionString.split(FUNCTION_SEPARATOR);
    return {
        libraryName: parts[0],
        functionName: parts[1]
    };
}

// ========================================
// Call a function in a TCP-based library
// ========================================
function callTCPFunction(worker, libraryName, functionName) {
    console.log('[native] Calling ' + libraryName + '.' + functionName);
    return worker.executeFunction(functionName);
}

// ========================================
// Export singleton instance
// ========================================
module.exports = {
    callFunction: callFunction
};
