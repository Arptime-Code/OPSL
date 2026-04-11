#!/usr/bin/env node

// ========================================
// opsl-cli.js
// Global CLI entry point for OPSL
// Usage: opsl script.opsl
// ========================================

var path = require('path');
var { spawn } = require('child_process');

var inputFile = process.argv[2];

if (!inputFile) {
    console.error('Usage: opsl <script.opsl>');
    console.error('Example: opsl test.opsl');
    process.exit(1);
}

// Resolve the runtime path relative to this CLI script
var runtimePath = path.join(__dirname, '..', 'runtimeTCP', 'main.js');

// Spawn the runtime with the user's script
var child = spawn('node', [runtimePath, inputFile], {
    stdio: 'inherit',
    cwd: process.cwd()
});

child.on('exit', function (code) {
    process.exit(code);
});
