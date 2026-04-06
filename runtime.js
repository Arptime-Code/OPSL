const fs = require("fs");
const path = require("path");

const parser = require("./parser");
const workerLib = require("./workers");
const nativeLib = require("./native-library/library");

const globalLibraries = {};
let inputFile = process.argv[2];

class Runtime
{
    baseFilePath = null;
    importedLibraries = {};

    constructor(baseFilePath = null)
    {
        this.baseFilePath = baseFilePath;
    }

    getBaseDir()
    {
        return path.dirname(this.baseFilePath);
    }

    createWorker(library, lang)
    {
        const baseDir = this.getBaseDir();
        const projectFolder = path.basename(baseDir);
        
        let filePath;
        
        if(library === projectFolder)
        {
            const rootFilePath = path.join(baseDir, library + ".js");
            if(fs.existsSync(rootFilePath))
            {
                filePath = rootFilePath;
            }
            else
            {
                const libDir = path.join(baseDir, "opsl-local", library);
                filePath = path.join(libDir, library + ".js");
            }
        }
        else
        {
            const libDir = path.join(baseDir, "opsl-local", library);
            filePath = path.join(libDir, library + ".js");
        }
        
        let worker;
        if(fs.existsSync(filePath))
        {
            worker = new workerLib.LanguageWorker(lang, filePath);
        }
        else
        {
            worker = new workerLib.LanguageWorker(lang, undefined);
        }
        
        if(lang === "opsl")
        {
            worker.originalLang = "opsl";
        }
        
        return worker;
    }

    async processOPSLString(fileString)
    {
        const lines = fileString.split("\n");
        
        for(let i = 0; i < lines.length; i++)
        {
            const instruction = parser.parseLine(lines[i]);

            if(instruction.type === "VARIABLE")
            {
                await this.handleVariable(instruction);
            }
            else if(instruction.type === "ASSIGN")
            {
                await this.handleAssign(instruction);
            }
            else if(instruction.type === "IMPORT")
            {
                await this.handleImport(instruction);
            }
            else if(instruction.type === "CALL")
            {
                await this.handleCall(instruction);
            }
        }
    }

    async handleImport(instruction)
    {
        if(this.importedLibraries[instruction.library])
        {
            return;
        }

        globalLibraries[instruction.library] = this.createWorker(instruction.library, instruction.lang);

        this.importedLibraries[instruction.library] = true;
    }

    async handleVariable(instruction)
    {
        if(this.importedLibraries[instruction.library])
        {
            await globalLibraries[instruction.library].createVariable(instruction.name, instruction.value);
        }
    }

    async handleAssign(instruction)
    {
        if(!this.importedLibraries[instruction.library] || !this.importedLibraries[instruction.libraryValue])
        {
            return;
        }

        const variableValue = await globalLibraries[instruction.libraryValue].getVariable(instruction.variableValue);
        await globalLibraries[instruction.library].setVariable(instruction.name, variableValue);
    }

    async handleCall(instruction)
    {
        if(!this.importedLibraries[instruction.library])
        {
            return;
        }

        if(instruction.library === "opsl" && instruction.name === "functionCall")
        {
            const functionString = await globalLibraries["opsl"].getVariable("functionVar");
            await nativeLib.callFunction(functionString, globalLibraries, this.importedLibraries);
            return;
        }

        const worker = globalLibraries[instruction.library];
        
        if(worker.originalLang === "opsl")
        {
            await this.executeOPSLFunction(instruction.library, instruction.name);
        }
        else
        {
            await worker.executeFunction(instruction.name);
        }
    }

    async executeOPSLFunction(library, name)
    {
        const baseDir = this.getBaseDir();
        const libDir = path.join(baseDir, "opsl-local", library);
        const functionFilePath = path.join(libDir, name + ".opsl");
        
        if(fs.existsSync(functionFilePath))
        {
            const functionFileString = fs.readFileSync(functionFilePath, "utf8");
            const nestedRuntime = new Runtime(this.baseFilePath);
            nestedRuntime.importedLibraries = this.importedLibraries;
            await nestedRuntime.processOPSLString(functionFileString);
        }
    }
}

const runtime = new Runtime(inputFile);
const inputFileString = fs.readFileSync(inputFile, "utf8");
(async function() {
    await runtime.processOPSLString(inputFileString);
})();