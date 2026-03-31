const fs = require("fs");
const readline = require('readline/promises');

const parser = require("./parser");
const workerLib = require("./workers");

let inputFile = process.argv[2];

let allWorkers = {};

class Runtime
{
    opslVariables = {};
    opslFunctions = {};

    constructor()
    {
    }

    async interactiveMode()
    {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        let userInput = "";

        while((userInput != "exit"))
        {
            userInput = await rl.question('> ');

            let instruction = parser.parseLine(userInput, "lib");

            if(instruction.type == "VARIABLE")
            {
                this.opslVariables[instruction.name] = instruction.value;
            }
            if(instruction.type == "ASSIGN")
            {
                const libraryLang = allWorkers[instruction.libraryValue].language;
                const variableValue = await allWorkers[instruction.libraryValue].getVariable(instruction.variableValue, libraryLang);
                const targetLang = allWorkers[instruction.library].language;
                await allWorkers[instruction.library].setVariable(instruction.name, variableValue, targetLang);
            }
            if(instruction.type == "IMPORT")
            {
                allWorkers[instruction.library] = new workerLib.LanguageWorker(instruction.lang, instruction.library + ".js");
            }
            if(instruction.type == "CALL")
            {
                const callLang = allWorkers[instruction.library].language;
                await allWorkers[instruction.library].executeFunction(instruction.name, callLang);
            }
        }
        rl.close();
    }

    async inputMode(fileString, libraryName)
    {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        let splitString = fileString.split("\n");
        let userInput = "";

        for(let y = 0; y < splitString.length; y++)
        {
            userInput = splitString[y];

            let instruction = parser.parseLine(userInput, libraryName);

            if(instruction.type == "VARIABLE")
            {
                this.opslVariables[instruction.name] = instruction.value;
            }
            if(instruction.type == "ASSIGN")
            {
                const libraryLang = allWorkers[instruction.libraryValue].language;
                const variableValue = await allWorkers[instruction.libraryValue].getVariable(instruction.variableValue, libraryLang);
                const targetLang = allWorkers[instruction.library].language;
                await allWorkers[instruction.library].setVariable(instruction.name, variableValue, targetLang);
            }
            if(instruction.type == "IMPORT")
            {
                allWorkers[instruction.library] = new workerLib.LanguageWorker(instruction.lang, instruction.library + ".js");
            }
            if(instruction.type == "CALL")
            {
                const callLang = allWorkers[instruction.library].language;
                await allWorkers[instruction.library].executeFunction(instruction.name, callLang);
            }
        }
        rl.close();
    }
}

const runtime = new Runtime();
let inputFileString = fs.readFileSync(inputFile, 'utf8');
let libraryName = inputFile.split("/")[inputFile.split("/").length - 2];
console.log( fs.readFileSync(inputFile, 'utf8'));
runtime.inputMode(inputFileString, libraryName);
console.log("hi");
