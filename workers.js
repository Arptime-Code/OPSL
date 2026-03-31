const vm = require("vm");

class LanguageWorker {
    context;
    capturedOutput = "";

    constructor(language, libraryFile) {
        this.context = vm.createContext({
            console: {
                log: (...args) => {
                    this.capturedOutput = args.map(a => String(a)).join(" ");
                    console.log(...args);
                },
                error: (...args) => console.error(...args),
                warn: (...args) => console.warn(...args),
            },
            setTimeout: setTimeout,
            setInterval: setInterval,
            clearTimeout: clearTimeout,
            clearInterval: clearInterval,
            Promise: Promise,
            Math: Math,
            Date: Date,
            JSON: JSON,
            Array: Array,
            Object: Object,
            String: String,
            Number: Number,
            Boolean: Boolean,
            Error: Error,
            TypeError: TypeError,
            RangeError: RangeError,
            SyntaxError: SyntaxError,
        });

        if (libraryFile) {
            const fs = require("fs");
            const code = fs.readFileSync(libraryFile, "utf8");
            this.send(code);
        }
    }

    send(code) {
        vm.runInContext(code, this.context);
    }

    setVariable(variableName, value) {
        let code;
        if (typeof value === "string") {
            code = variableName + ' = "' + value + '";';
        } else {
            code = variableName + " = " + value + ";";
        }
        vm.runInContext(code, this.context);
    }

    getVariable(variableName) {
        this.capturedOutput = "";
        vm.runInContext("console.log(" + variableName + ")", this.context);
        return this.capturedOutput;
    }

    async executeFunction(functionName) {
        vm.runInContext(functionName + "()", this.context);
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