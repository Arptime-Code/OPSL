const LanguageWorker = require("./workers.js");

let w = new LanguageWorker("py", "test.py");
console.log("init:", w.getOutput());

setTimeout(async () => {
    w.sendInput("x = \"42\"");
    console.log("after x=42:", w.getOutput());
    
    setTimeout(async () => {
        console.log("about to call getVariable");
        let result = await w.getVariable("x");
        console.log("getVariable x:" + result);
        
        setTimeout(() => {
            process.exit(0);
        }, 500);
    }, 1000);
}, 1000);