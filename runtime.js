const fs = require("fs");
const path = require("path");
const readline = require('readline/promises');

const parser = require("./parser");
const workerLib = require("./workers");
const nativeLib = require("./native-library/library");

const globalLibraries = {};

let inputFile = process.argv[2];

class Runtime
{
    currentFilePath = null;
    baseFilePath = null;
    importedLibraries = {};

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
        if(this.importedLibraries[instruction.library])
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
                globalLibraries[instruction.library] = new workerLib.LanguageWorker("js", jsFilePath);
            }
            else
            {
                globalLibraries[instruction.library] = new workerLib.LanguageWorker("js", undefined);
            }
            
            globalLibraries[instruction.library].originalLang = "opsl";

            const opslFilePath = path.join(opslDir, instruction.library + ".opsl");
            if(fs.existsSync(opslFilePath))
            {
                const opslFileString = fs.readFileSync(opslFilePath, 'utf8');
                const nestedRuntime = new Runtime(opslFilePath, this.baseFilePath);
                nestedRuntime.importedLibraries = this.importedLibraries;
                await nestedRuntime.processOPSLString(opslFileString, instruction.library);
            }
        }
        else
        {
            const libDir = path.join(baseDir, "opsl-local", instruction.library);
            const jsFilePath = path.join(libDir, instruction.library + ".js");
            
            if(fs.existsSync(jsFilePath))
            {
                globalLibraries[instruction.library] = new workerLib.LanguageWorker(instruction.lang, jsFilePath);
            }
            else
            {
                globalLibraries[instruction.library] = new workerLib.LanguageWorker(instruction.lang, undefined);
            }
        }

        this.importedLibraries[instruction.library] = true;
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
                if(this.importedLibraries[instruction.library])
                {
                    const varLang = globalLibraries[instruction.library].language;
                    await globalLibraries[instruction.library].createVariable(instruction.name, instruction.value);
                }
            }
            if(instruction.type == "ASSIGN")
            {
                if(!this.importedLibraries[instruction.library] || !this.importedLibraries[instruction.libraryValue])
                {
                    continue;
                }
                const libraryLang = globalLibraries[instruction.libraryValue].language;
                const variableValue = await globalLibraries[instruction.libraryValue].getVariable(instruction.variableValue);
                const targetLang = globalLibraries[instruction.library].language;
                await globalLibraries[instruction.library].setVariable(instruction.name, variableValue);
            }
            if(instruction.type == "IMPORT")
            {
                await this.handleImport(instruction);
            }
            if(instruction.type == "CALL")
            {
                if(!this.importedLibraries[instruction.library])
                {
                    continue;
                }

                if(instruction.library === "opsl" && instruction.name === "functionCall")
                {
                    const functionString = await globalLibraries["opsl"].getVariable("functionVar");
                    await nativeLib.callFunction(functionString, globalLibraries, this.importedLibraries);
                }
                else
                {
                    const worker = globalLibraries[instruction.library];
                    
                    if(worker.originalLang === "opsl")
                    {
                        const baseDir = this.getBaseDir();
                        const libDir = path.join(baseDir, "opsl-local", instruction.library);
                        const functionFilePath = path.join(libDir, instruction.name + ".opsl");
                        
                        if(fs.existsSync(functionFilePath))
                        {
                            const functionFileString = fs.readFileSync(functionFilePath, 'utf8');
                            const nestedRuntime = new Runtime(functionFilePath, this.baseFilePath);
                            nestedRuntime.importedLibraries = this.importedLibraries;
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
