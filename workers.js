const { spawn } = require("child_process");
const fs = require("fs");

class LanguageWorker {
    process;
    config;
    output = "";
    pending = null;
    pendingType = null;
    buffer = "";

    constructor(language, libraryFile) {
        this.config = JSON.parse(fs.readFileSync(`langs/commands/${language}.json`, "utf8"));
        this.process = spawn(this.config.command, this.config.parameters, { stdio: ["pipe", "pipe", "inherit"] });

        this.process.stdout.setEncoding("utf8");
        this.process.stdout.on("data", (data) => {
            this.buffer += data;
            this.output += data;
            // process.stdout.write("[stdout] " + data);

            if (this.pending) {
                const id = this.config.identifier;
                const parts = this.buffer.split(id);
                
                switch (this.pendingType) {
                    case "variable":
                        if (parts.length >= 4) {
                            this.pending(parts[2]);
                            this.pending = null;
                            this.pendingType = null;
                            this.buffer = "";
                        }
                        break;
                    case "send":
                        if (parts.length >= 3) {
                            this.pending(undefined);
                            this.pending = null;
                            this.pendingType = null;
                            this.buffer = "";
                        }
                        break;
                }
            }
        });

        this.process.on("exit", (code) => {
            console.log("\nprocess exited with code:", code);
        });

        if (libraryFile) {
            this.send(fs.readFileSync(libraryFile, "utf8"));
        }
    }

    send(code) {
        return new Promise((resolve) => {
            this.pending = resolve;
            this.pendingType = "send";
            this.process.stdin.write(this.config.sentinelLog + code + this.config.sentinelLog + "\n");
        });
    }

    getVariable(variableName) {
        const code = this.config.variableLog.replace("variable", variableName);
        return new Promise((resolve) => {
            this.pending = resolve;
            this.pendingType = "variable";
            this.process.stdin.write(this.config.sentinelLog + code + this.config.sentinelLog + "\n");
        });
    }

    executeFunction(functionName) {
        const code = this.config.functionLog.replace("function", functionName);
        return this.send(code);
    }

    getOutput() {
        return this.output;
    }

    close() {
        this.process.stdin.end();
    }
}

module.exports = LanguageWorker;

if (require.main === module) {
    (async () => {
        const jsWorker = new LanguageWorker("js", "test.js");

        await new Promise(r => setTimeout(r, 3000));
        
        console.log("\n--- send y = 5 ---");
        await jsWorker.send("let y = 5;");
        
        console.log("\n--- getVariable y ---");
        const yValue = await jsWorker.getVariable("y");
        console.log("RESULT: getVariable returned:", yValue);
        
        console.log("\n--- executeFunction sayHello ---");
        await jsWorker.executeFunction("sayHello");
        
        console.log("\n--- getOutput ---");
        console.log(jsWorker.getOutput());

        jsWorker.close();
    })();
}