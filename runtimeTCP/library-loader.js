// ========================================
// library-loader.js
// Finds library files on disk and creates workers
// ========================================

var fs = require('fs');
var path = require('path');
var tcpWorkerLib = require('../tcp-workers');

// Language → file extension mapping. Add new languages here.
var languageExtensions = {
    js: '.js',
    opsl: '.opsl'
};

// ========================================
// Find the full file path for a library by name
// ========================================
function findLibraryPath(baseFilePath, libraryName, language) {
    var baseDir = path.dirname(baseFilePath);
    var projectFolder = path.basename(baseDir);
    var ext = languageExtensions[language];

    // No extension known for this language — skip
    if (!ext) return null;

    // Check if library file is in project root
    var rootPath = path.join(baseDir, libraryName + ext);
    if (fs.existsSync(rootPath)) {
        return rootPath;
    }

    // Check in opsl-local folder
    var localPath = path.join(baseDir, 'opsl-local', libraryName, libraryName + ext);
    if (fs.existsSync(localPath)) {
        return localPath;
    }

    return null;
}

// ========================================
// Create a TCP worker for a library
// ========================================
async function loadLibrary(baseFilePath, libraryName, language) {
    var filePath = findLibraryPath(baseFilePath, libraryName, language);
    var worker = await tcpWorkerLib.createWorker(language, libraryName, filePath);

    if (language === 'opsl') {
        worker.originalLang = 'opsl';
    }

    return worker;
}

module.exports = {
    loadLibrary: loadLibrary
};
