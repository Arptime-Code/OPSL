#!/usr/bin/env node

// ========================================
// opslpm — OPSL Package Manager
// Save and import OPSL projects
// ========================================

var fs = require('fs');
var path = require('path');
var { execSync } = require('child_process');

var OPML_DIR = path.join(process.env.HOME, '.opslpm');

// ========================================
// Main
// ========================================
var args = process.argv.slice(2);

if (args.length === 0) {
    printUsage();
    process.exit(1);
}

if (args[0] === '-s') {
    saveProject();
}

else if (args[0] === '-i') {
    if (!args[1]) {
        console.error('Error: Please provide a project name');
        console.error('Usage: opslpm -i <project-name>');
        process.exit(1);
    }
    importProject(args[1]);
}

else if (args[0] === '-l') {
    listProjects();
}

else {
    console.error('Unknown option: ' + args[0]);
    printUsage();
    process.exit(1);
}

// ========================================
// Save current folder to ~/.opslpm
// ========================================
function saveProject() {
    var sourceDir = process.cwd();
    var name = path.basename(sourceDir);
    var destDir = path.join(OPML_DIR, name);

    // Create ~/.opslpm if it doesn't exist
    if (!fs.existsSync(OPML_DIR)) {
        fs.mkdirSync(OPML_DIR, { recursive: true });
    }

    // Copy folder
    console.log('Saving "' + name + '" to ' + destDir);
    copyFolder(sourceDir, destDir);
    console.log('Done!');
}

// ========================================
// Import a project from ~/.opslpm to current project's opsl-local
// ========================================
function importProject(name) {
    var sourceDir = path.join(OPML_DIR, name);

    // Check if the project exists in ~/.opslpm
    if (!fs.existsSync(sourceDir)) {
        console.error('Error: Project "' + name + '" not found in ~/.opslpm');
        listProjects();
        process.exit(1);
    }

    // Create opsl-local in current directory if it doesn't exist
    var projectDir = process.cwd();
    var localDir = path.join(projectDir, 'opsl-local');
    if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
    }

    // Copy the folder into opsl-local
    var destDir = path.join(localDir, name);
    console.log('Importing "' + name + '" into opsl-local/');
    copyFolder(sourceDir, destDir);
    console.log('Done!');
}

// ========================================
// List saved projects
// ========================================
function listProjects() {
    if (!fs.existsSync(OPML_DIR)) {
        console.log('No saved projects yet.');
        return;
    }

    var projects = fs.readdirSync(OPML_DIR).filter(function (item) {
        return fs.statSync(path.join(OPML_DIR, item)).isDirectory();
    });

    if (projects.length === 0) {
        console.log('No saved projects yet.');
        return;
    }

    console.log('Saved projects in ~/.opslpm:');
    projects.forEach(function (p) {
        console.log('  ' + p);
    });
}

// ========================================
// Copy folder recursively
// ========================================
function copyFolder(source, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    var items = fs.readdirSync(source);

    items.forEach(function (item) {
        var srcPath = path.join(source, item);
        var destPath = path.join(dest, item);

        if (fs.statSync(srcPath).isDirectory()) {
            copyFolder(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

// ========================================
// Print usage
// ========================================
function printUsage() {
    console.log('opslpm — OPSL Package Manager');
    console.log('');
    console.log('Usage:');
    console.log('  opslpm -s           Save current project to ~/.opslpm');
    console.log('  opslpm -i <name>    Import a project from ~/.opslpm into opsl-local/');
    console.log('  opslpm -l           List saved projects');
}
