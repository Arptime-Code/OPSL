const vm = require("vm");

class LanguageWorker {
    context;
    capturedOutput = "";
    language;

    constructor(language, libraryFile) {
        this.language = language;
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
            this.send(code, language);
        }
    }

    send(code, language) {
        vm.runInContext(code, this.context);
    }

    setVariable(variableName, value, language) {
        let code;
        if (typeof value === "string") {
            code = variableName + ' = "' + value + '";';
        } else {
            code = variableName + " = " + value + ";";
        }
        vm.runInContext(code, this.context);
    }

    getVariable(variableName, language) {
        this.capturedOutput = "";
        vm.runInContext("console.log(" + variableName + ")", this.context);
        return this.capturedOutput;
    }

    async executeFunction(functionName, language) {
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