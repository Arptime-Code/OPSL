const { Runtime } = require("../runtime");

class NativeOPSL
{
    async callFunction(functionString, globalLibraries, importedLibraries, baseFilePath)
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
            const runtime = new Runtime(baseFilePath);
            runtime.importedLibraries = importedLibraries;
            await runtime.executeOPSLFunction(libraryName, functionName);
        }
        else
        {
            await worker.executeFunction(functionName);
        }
    }
}

module.exports = new NativeOPSL();