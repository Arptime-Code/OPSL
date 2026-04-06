const fs = require("fs");
const path = require("path");

const Runtime = require("../runtime");

class NativeOPSL
{
    async callFunction(functionString, globalLibraries, importedLibraries)
    {
        const parts = functionString.split(".");
        const libraryName = parts[0];
        const functionName = parts[1];
        
        if(!importedLibraries[libraryName])
        {
            return;
        }
        
        const worker = globalLibraries[libraryName];
        
        if(!worker)
        {
            return;
        }
        
        if(worker.originalLang === "opsl")
        {
            await this.executeOPSLFunction(libraryName, functionName, importedLibraries);
        }
        else
        {
            await worker.executeFunction(functionName);
        }
    }

    async executeOPSLFunction(libraryName, functionName, importedLibraries)
    {
        const baseDir = path.dirname(require.main.filename);
        const libDir = path.join(baseDir, "opsl-local", libraryName);
        const functionFilePath = path.join(libDir, functionName + ".opsl");
        
        if(!fs.existsSync(functionFilePath))
        {
            return;
        }
        
        const functionFileString = fs.readFileSync(functionFilePath, "utf8");
        const nestedRuntime = new Runtime(functionFilePath);
        nestedRuntime.importedLibraries = importedLibraries;
        await nestedRuntime.processOPSLString(functionFileString);
    }
}

module.exports = new NativeOPSL();