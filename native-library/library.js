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
        
        if(globalLibraries[libraryName])
        {
            const worker = globalLibraries[libraryName];
            
            if(worker.originalLang === "opsl")
            {
                const fs = require("fs");
                const path = require("path");
                
                const baseDir = path.dirname(require.main.filename);
                const libDir = path.join(baseDir, "opsl-local", libraryName);
                const functionFilePath = path.join(libDir, functionName + ".opsl");
                
                if(fs.existsSync(functionFilePath))
                {
                    const functionFileString = fs.readFileSync(functionFilePath, 'utf8');
                    const Runtime = require("./runtime");
                    const nestedRuntime = new Runtime(functionFilePath);
                    nestedRuntime.importedLibraries = importedLibraries;
                    await nestedRuntime.processOPSLString(functionFileString, libraryName);
                }
            }
            else
            {
                await worker.executeFunction(functionName);
            }
        }
    }
}

module.exports = new NativeOPSL();
