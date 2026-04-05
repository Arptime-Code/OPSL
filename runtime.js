const fs = require("fs");
const path = require("path");
const readline = require('readline/promises');

const parser = require("./parser");
const workerLib = require("./workers");
const nativeLib = require("./native-library/library");

let inputFile = process.argv[2];

class Runtime
{
    currentFilePath = null;
    baseFilePath = null;
    allWorkers = {};

    constructor(currentFilePath = null, baseFilePath = null)
    {
        this.currentFilePath = currentFilePath;
        this.baseFilePath = baseFilePath || currentFilePath;
    }

    getBaseDir()
    {
        return path.dirname(this.baseFilePath);
    }

    async handleImport(instruction)
    {
        if(this.allWorkers[instruction.library])
        {
            return;
        }

        const baseDir = this.getBaseDir();
        
        if(instruction.lang === "opsl")
        {
            const opslDir = path.join(baseDir, "opsl-local", instruction.library);
            const jsDir = path.join(baseDir, "opsl-local", instruction.library);
            
            const jsFilePath = path.join(jsDir, instruction.library + ".js");
            if(fs.existsSync(jsFilePath))
            {
                this.allWorkers[instruction.library] = new workerLib.LanguageWorker("js", jsFilePath);
            }
            else
            {
                this.allWorkers[instruction.library] = new workerLib.LanguageWorker("js", undefined);
            }
            
            this.allWorkers[instruction.library].originalLang = "opsl";

            const opslFilePath = path.join(opslDir, instruction.library + ".opsl");
            if(fs.existsSync(opslFilePath))
            {
                const opslFileString = fs.readFileSync(opslFilePath, 'utf8');
                const nestedRuntime = new Runtime(opslFilePath, this.baseFilePath);
                nestedRuntime.allWorkers = this.allWorkers;
                await nestedRuntime.processOPSLString(opslFileString, instruction.library);
            }
        }
        else
        {
            const libDir = path.join(baseDir, "opsl-local", instruction.library);
            const jsFilePath = path.join(libDir, instruction.library + ".js");
            
            if(fs.existsSync(jsFilePath))
            {
                this.allWorkers[instruction.library] = new workerLib.LanguageWorker(instruction.lang, jsFilePath);
            }
            else
            {
                this.allWorkers[instruction.library] = new workerLib.LanguageWorker(instruction.lang, undefined);
            }
        }
    }

    async processOPSLString(fileString, libraryName)
    {
        let splitString = fileString.split("\n");
        
        for(let y = 0; y < splitString.length; y++)
        {
            let userInput = splitString[y];
            let instruction = parser.parseLine(userInput);

            if(instruction.type == "VARIABLE")
            {
                if(this.allWorkers[instruction.library])
                {
                    const varLang = this.allWorkers[instruction.library].language;
                    await this.allWorkers[instruction.library].createVariable(instruction.name, instruction.value);
                }
            }
            if(instruction.type == "ASSIGN")
            {
                const libraryLang = this.allWorkers[instruction.libraryValue].language;
                const variableValue = await this.allWorkers[instruction.libraryValue].getVariable(instruction.variableValue);
                const targetLang = this.allWorkers[instruction.library].language;
                await this.allWorkers[instruction.library].setVariable(instruction.name, variableValue);
            }
            if(instruction.type == "IMPORT")
            {
                await this.handleImport(instruction);
            }
            if(instruction.type == "CALL")
            {
                if(instruction.library === "opsl" && instruction.name === "functionCall")
                {
                    const functionString = await this.allWorkers["opsl"].getVariable("functionVar");
                    await nativeLib.callFunction(functionString, this.allWorkers);
                }
                else
                {
                    const worker = this.allWorkers[instruction.library];
                    
                    if(worker.originalLang === "opsl")
                    {
                        const baseDir = this.getBaseDir();
                        const libDir = path.join(baseDir, "opsl-local", instruction.library);
                        const functionFilePath = path.join(libDir, instruction.name + ".opsl");
                        
                        if(fs.existsSync(functionFilePath))
                        {
                            const functionFileString = fs.readFileSync(functionFilePath, 'utf8');
                            const nestedRuntime = new Runtime(functionFilePath, this.baseFilePath);
                            nestedRuntime.allWorkers = this.allWorkers;
                            await nestedRuntime.processOPSLString(functionFileString, instruction.library);
                        }
                    }
                    else
                    {
                        await worker.executeFunction(instruction.name);
                    }
                }
            }
        }
    }

    async inputMode(fileString, libraryName)
    {
        await this.processOPSLString(fileString, libraryName);
    }
}

const runtime = new Runtime(inputFile);
let inputFileString = fs.readFileSync(inputFile, 'utf8');
let libraryName = inputFile.split("/")[inputFile.split("/").length - 2];
console.log( fs.readFileSync(inputFile, 'utf8'));
runtime.inputMode(inputFileString, libraryName);
console.log("hi");
