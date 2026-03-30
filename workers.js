const { spawn } = require("child_process");
const fs = require("fs");

class LanguageWorker {
    process;
    config;
    output = "";
    buffer = "";

    constructor(language, libraryFile) {
        this.config = JSON.parse(fs.readFileSync(`langs/commands/${language}.json`, "utf8"));
        this.process = spawn(this.config.command, this.config.parameters, { stdio: ["pipe", "pipe", "inherit"] });

        this.process.stdout.setEncoding("utf8");
        this.process.stdout.on("data", (data) => {
            this.buffer += data;
            this.output += data;
            // process.stdout.write("[stdout] " + data);
        });

        this.process.on("exit", (code) => {
            console.log("\nprocess exited with code:", code);
        });

        if (libraryFile) {
            this.send(fs.readFileSync(libraryFile, "utf8"));
        }
    }

    send(code) {
        this.process.stdin.write(this.config.sentinelLog + code + this.config.sentinelLog + "\n");
    }

    async setVariable(variableName, value) {
        const code = this.config.variableSet.replace("variable", variableName).replace("value", value);
        this.send(code);
        // Wait for the operation to complete
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    async getVariable(variableName) {
        const code = this.config.variableLog.replace("variable", variableName);
        // Clear buffer before sending so we only get the output of this command
        this.buffer = "";
        this.process.stdin.write(this.config.sentinelLog + code + this.config.sentinelLog + "\n");
        
        // Wait for processing using promise-based timeout (NON-BLOCKING)
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Extract value from buffer
        const output = this.buffer.trim();
        let value = output;
        // console.log("out: " + output);

        // Remove surrounding quotes if present (from our js.json config)
        if (output.length >= 2 && output.startsWith('"') && output.endsWith('"')) {
            value = output.substring(1, output.length - 1);
        }
        // Clear buffer after reading
        this.buffer = "";
        return value; // Return actual value, not a promise
    }

    async executeFunction(functionName) {
        const code = this.config.functionLog.replace("function", functionName);
        this.send(code);
        // Wait for the operation to complete
        await new Promise(resolve => setTimeout(resolve, 50));

        console.log(this.getOutput());
    }


    async executeOPSLFunction(functionName) {

    }

    async setNewOPSLVariable(variableName) {

    }

    getOutput() {
        return this.output;
    }

    close() {
        this.process.stdin.end();
    }
}

module.exports = {
    LanguageWorker
};

// if (require.main === module) {
//     (async () => {
//         const jsWorker = new LanguageWorker("js", "test.js");
        
//         await new Promise(r => setTimeout(r, 3000));
         
//         console.log("\n--- send y = 5 ---");
//         await jsWorker.send("let y = 5;");
         
//         console.log("\n--- getVariable y ---");
//         const yValue = await jsWorker.getVariable("y");
//         console.log("RESULT: getVariable returned:", yValue);
//         
//         console.log("\n--- executeFunction sayHello ---");
//         await jsWorker.executeFunction("sayHello");
//         
//         console.log("\n--- getOutput ---");
//         console.log(jsWorker.getOutput());
//         
//         jsWorker.close();
//     })();
// }