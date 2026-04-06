class NativeOPSL
{
    async callFunction(functionString, globalLibraries, importedLibraries, executeOPSLFunction)
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
            await executeOPSLFunction(libraryName, functionName);
        }
        else
        {
            await worker.executeFunction(functionName);
        }
    }
}

module.exports = new NativeOPSL();