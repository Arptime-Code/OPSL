// ========================================
// opsl-executor.js
// Executes nested .opsl files (OPSL calling OPSL)
// ========================================

const fs = require('fs');
const path = require('path');

// Find the .opsl file for a function and execute it
// `Runtime` is passed in by the caller to avoid circular dependency
async function executeOPSLFunction(runtime, library, name) {
    var functionFilePath = findOPSLFile(runtime, library, name);

    if (!functionFilePath) {
        console.log('OPSL function file not found: ' + name + '.opsl');
        return;
    }

    var functionFileString = fs.readFileSync(functionFilePath, 'utf8');

    // Dynamically require to avoid circular dependency
    var Runtime = require('./runtime');

    // Create a nested runtime that shares the same imported libraries
    var nestedRuntime = new Runtime(runtime.baseFilePath);
    nestedRuntime.importedLibraries = Object.assign({}, runtime.importedLibraries);
    await nestedRuntime.processOPSLString(functionFileString);
}

// Search for an .opsl file in project root or opsl-local
function findOPSLFile(runtime, library, name) {
    var baseDir = runtime.getBaseDir();
    var projectFolder = path.basename(baseDir);

    // Check project root
    var rootPath = path.join(baseDir, name + '.opsl');
    if (fs.existsSync(rootPath)) {
        return rootPath;
    }

    // Check opsl-local
    var localPath = path.join(baseDir, 'opsl-local', library, name + '.opsl');
    if (fs.existsSync(localPath)) {
        return localPath;
    }

    return null;
}

module.exports = {
    executeOPSLFunction: executeOPSLFunction
};
