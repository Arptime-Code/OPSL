class NativeOPSL
{
    async callFunction(functionString, allWorkers)
    {
        const parts = functionString.split(".");
        const libraryName = parts[0];
        const functionName = parts[1];
        
        if(allWorkers[libraryName])
        {
            const worker = allWorkers[libraryName];
            
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
                    nestedRuntime.allWorkers = allWorkers;
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
