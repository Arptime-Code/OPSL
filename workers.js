const vm = require("vm");
const fs = require("fs");

class LanguageWorker {
    context;
    capturedOutput = "";
    language;
    config;

    constructor(language, libraryFile) {
        this.language = language;
        this.config = JSON.parse(fs.readFileSync("langs/commands/" + language + ".json", "utf8"));

        this.context = vm.createContext({
            console: {
                log: (...args) => {
                    this.capturedOutput = args.join(" ");
                    console.log(...args);
                },
                error: (...args) => console.error(...args),
                warn: (...args) => console.warn(...args),
            },
            setTimeout: setTimeout,
            setInterval: setInterval,
            clearTimeout: clearTimeout,
            clearInterval: clearInterval
        });

        if (libraryFile) {
            const code = fs.readFileSync(libraryFile, "utf8");
            this.send(code);
        }
    }

    send(code) {
        vm.runInContext(code, this.context);
    }

    setVariable(variableName, value) {
        const code = this.config.variableSet.replace("variable", variableName).replace("value", value);
        vm.runInContext(code, this.context);
    }

    createVariable(variableName, value) {
        try {
            const code = this.config.variableCreate.replace("variable", variableName).replace("value", value);
            vm.runInContext(code, this.context);
        } catch(e) {
            const code = this.config.variableSet.replace("variable", variableName).replace("value", value);
            vm.runInContext(code, this.context);
        }
    }

    getVariable(variableName) {
        this.capturedOutput = "";
        const code = this.config.variableLog.replace("variable", variableName);
        vm.runInContext(code, this.context);
        return this.capturedOutput;
    }

    async executeFunction(functionName) {
        const code = this.config.functionLog.replace("function", functionName);
        vm.runInContext(code, this.context);
    }

    getOutput() {
        return "";
    }

    close() {
        this.context = null;
    }
}

module.exports = {
    LanguageWorker
};