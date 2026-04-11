// ========================================
// library-loader.js
// Finds library files on disk and creates workers
// ========================================

const fs = require('fs');
const path = require('path');
const tcpWorkerLib = require('../tcp-workers');

// Find the full file path for a library by name
function findLibraryPath(baseFilePath, libraryName) {
    var baseDir = path.dirname(baseFilePath);
    var projectFolder = path.basename(baseDir);

    // Check if library file is in project root
    if (libraryName === projectFolder) {
        var rootPath = path.join(baseDir, libraryName + '.js');
        if (fs.existsSync(rootPath)) {
            return rootPath;
        }
    }

    // Check in opsl-local folder
    var localPath = path.join(baseDir, 'opsl-local', libraryName, libraryName + '.js');
    if (fs.existsSync(localPath)) {
        return localPath;
    }

    return null;
}

// Create a TCP worker for a library
async function loadLibrary(baseFilePath, libraryName, language) {
    var filePath = findLibraryPath(baseFilePath, libraryName);
    var worker = await tcpWorkerLib.createWorker(language, libraryName, filePath);

    if (language === 'opsl') {
        worker.originalLang = 'opsl';
    }

    return worker;
}

module.exports = {
    loadLibrary: loadLibrary
};
