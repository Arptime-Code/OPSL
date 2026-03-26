const fs = require("fs");

const parser = require("./parser");



let inputFile = process.argv[2];

let inputFileString = fs.readFileSync(inputFile, 'utf8');

parser.parse(inputFileString, "lib");