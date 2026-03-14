const fs = require("fs");

const parser = require("./parser.js");
const executor = require("./executor.js");


const scriptPath = process.argv[2];
if(!scriptPath)
{
    console.error("No script path  -  Usage: node runtime.js <script.opsl>");
    process.exit(1);
}


let source;
try {
    source = fs.readFileSync(scriptPath, "utf8");
} catch (e) {
    console.error(`[OPSL] Cannot read file: ${scriptPath}`);
    process.exit(1);
}


const lines = source.split("\n");


const instructions = parser.parse(lines);
executor.execute(instructions);




// process.on("exit", () => workerManager.shutdownAll());
// process.on("SIGINT", () => { workerManager.shutdownAll(); process.exit(0); });