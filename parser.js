// ========================================
// parser.js
// Converts OPSL instruction lines into structured objects
// ========================================

var config = require('./config.json');

// Configuration: keywords recognized by the parser
var IMPORT_KEYWORD = config.parser.import_keyword;
var ASSIGN_KEYWORD = config.parser.assign_keyword;
var VARIABLE_KEYWORD = config.parser.variable_keyword;
var CALL_KEYWORD = config.parser.call_keyword;

// Configuration: delimiter sets for each instruction type
var IMPORT_DELIMS = [' ', '[', ']'];
var ASSIGN_DELIMS = [' = ', '.', ' '];
var VARIABLE_DELIMS_LEFT = ['VARIABLE ', '.'];
var VARIABLE_DELIMS_RIGHT = ['"'];
var VARIABLE_DELIMS_EQ = [' = '];
var CALL_DELIMS = ['.', ' '];

// ========================================
// Main entry point — parse a single OPSL line
// ========================================
function parseLine(lineInput) {
    var instruction = {};
    var trimmed = lineInput.trim();

    if (trimmed.startsWith(IMPORT_KEYWORD)) {
        instruction = parseImport(trimmed);
    }
    if (trimmed.startsWith(ASSIGN_KEYWORD)) {
        instruction = parseAssign(trimmed);
    }
    if (trimmed.startsWith(VARIABLE_KEYWORD)) {
        instruction = parseVariable(trimmed);
    }
    if (trimmed.startsWith(CALL_KEYWORD)) {
        instruction = parseCall(trimmed);
    }

    return instruction;
}

// ========================================
// Parse IMPORT [lang] library
// ========================================
function parseImport(trimmed) {
    var tokens = splitBy(trimmed, IMPORT_DELIMS);
    return {
        type: 'IMPORT',
        lang: tokens[2],
        library: tokens[4]
    };
}

// ========================================
// Parse ASSIGN target.name = source.var
// ========================================
function parseAssign(trimmed) {
    var tokens = splitBy(trimmed, ASSIGN_DELIMS);
    return {
        type: 'ASSIGN',
        library: tokens[1],
        name: tokens[2],
        libraryValue: tokens[3],
        variableValue: tokens[4]
    };
}

// ========================================
// Parse VARIABLE lib.name = "value"
// ========================================
function parseVariable(trimmed) {
    var eqParts = splitBy(trimmed, VARIABLE_DELIMS_EQ);
    var leftTokens = splitBy(eqParts[0], VARIABLE_DELIMS_LEFT);
    var valueTokens = splitBy(eqParts[1], VARIABLE_DELIMS_RIGHT);

    return {
        type: 'VARIABLE',
        library: leftTokens[1],
        name: leftTokens[2],
        value: valueTokens[1]
    };
}

// ========================================
// Parse CALL library.functionName
// ========================================
function parseCall(trimmed) {
    var tokens = splitBy(trimmed, CALL_DELIMS);
    return {
        type: 'CALL',
        library: tokens[1],
        name: tokens[2]
    };
}

// ========================================
// Replace each delimiter with '|', then split
// ========================================
function splitBy(text, replacements) {
    for (var i = 0; i < replacements.length; i++) {
        text = text.replaceAll(replacements[i], '|');
    }
    return text.split('|');
}

module.exports = {
    parseLine: parseLine
};
