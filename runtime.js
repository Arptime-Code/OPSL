const fs = require("fs");
const readline = require('readline/promises');


const parser = require("./parser");
const workerLib = require("./workers");



let inputFile = process.argv[2];




let allWorkers = {};




// function ru2ntime(inputFile)
// {
//     let inputFileString = fs.readFileSync(inputFile, 'utf8');
//     let instructions = parser.parse(inputFileString, "currentLib");



//     for(let i = 0; i < instructions.length; i++)
//     {
//         console.log("First Test: " + JSON.stringify(instructions[i]));
//     }


//     //What i need:
//     //- Saving funtions
//     //- Saving opsl native Variables
//     //
//     //- Importing a library -> activate worker   (later i also need an opsl worker)
//     //- Calling a function from a library worker -> opsl would just be: give me that code and basically that gets added to the instructions
//     //- Setting and getting a variable from a library and assign it to another

//     //Maybe next i have to create an opsl worker that handles functions and variable storing to be called
// }



class Runtime
{
    opslVariables = {};
    opslFunctions = {};




    constructor()
    {
        
    }

    async interactiveMode()
    {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });


        // let inFunction = false;
        // let lastFunction = {};



        let userInput = "";


        while((userInput != "exit"))
        {
            userInput = await rl.question('> ');

            //Make this to actual lib name

            let instruction = parser.parseLine(userInput, "lib");

            // console.log(instruction);
            // console.log(userInput);



            // //Actual executor here:
            // if(inFunction)
            // {
            //     if(instruction.type != "END")
            //     {
            //         lastFunction.body.push(instruction);
            //         //Append the function with body ot the database of functions that is lastFunction
            //     } else {
            //         inFunction = false;
            //         //Here push the function so it can get saved somewhere
            //     }
            // } else {
            //     if(instruction.type == "DEFINE")
            //     {
            //         inFunction = true;
            //         //Save this function somewhere in the runtime and set it as lastFunction so a body can be added
            //         lastFunction = instruction;
            //     }
                if(instruction.type == "VARIABLE")
                {
                    //I ALSO need the library  logic first before this!!!!!!!!!!!!!!!!!!!!
                    this.opslVariables[instruction.name] = instruction.value;
                }
                if(instruction.type == "ASSIGN")
                {
                    // console.log("hi2");
                    // console.log(instruction.variableValue);
                    // console.log("helio: " + await allWorkers[instruction.libraryValue].getVariable(instruction.name));
                    
                    // Get the value from the source library variable
                    const variableValue = await allWorkers[instruction.libraryValue].getVariable(instruction.variableValue);
                    
                    // console.log("DEBUG value:", variableValue);
                    
                    // Set the variable in the target library
                    await allWorkers[instruction.library].setVariable(instruction.name, variableValue);

                    // console.log("DEBUG value:", variableValue);
                    // console.log("helio: " + await allWorkers[instruction.libraryValue].getVariable(instruction.name));
                    
                    // console.log("Assignment complete");
                }
                if(instruction.type == "IMPORT")
                {
                    //instrction library has to have a path to .local-offlinepm

                    //How to realy wait until a library is fully executed????
                    // console.log("hi");
                    allWorkers[instruction.library] = new workerLib.LanguageWorker(instruction.lang, instruction.library + ".js");
                    
                    // Wait for library initialization
                    await new Promise(r => setTimeout(r, 200));
                }
                if(instruction.type == "CALL")
                {
                    await allWorkers[instruction.library].executeFunction(instruction.name);
                }
        //     }
        }
        rl.close();
    }

    async inputMode(fileString)
    {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });


        // let inFunction = false;
        // let lastFunction = {};


        let splitString = fileString.split("\n");
        let userInput = "";


        for(let y = 0; y < splitString.length; y++)
        {
            userInput = splitString[y];

            //Also make this be the real lib

            let instruction = parser.parseLine(userInput, "lib");

            // console.log(instruction);
            // console.log(userInput);



            //Actual executor here:
            // if(inFunction)
            // {
            //     if(instruction.type != "END")
            //     {
            //         lastFunction.body.push(instruction);
            //         //Append the function with body ot the database of functions that is lastFunction
            //     } else {
            //         inFunction = false;
            //         //Here push the function so it can get saved somewhere
            //     }
            // } else {
            //     if(instruction.type == "DEFINE")
            //     {
            //         inFunction = true;
            //         //Save this function somewhere in the runtime and set it as lastFunction so a body can be added
            //         lastFunction = instruction;
            //     }
                if(instruction.type == "VARIABLE")
                {
                    //I ALSO need the library  logic first before this!!!!!!!!!!!!!!!!!!!!
                    this.opslVariables[instruction.name] = instruction.value;
                }
                if(instruction.type == "ASSIGN")
                {
                    // console.log("hi2");
                    // console.log(instruction.variableValue);
                    // console.log("helio: " + await allWorkers[instruction.libraryValue].getVariable(instruction.name));
                    
                    // Get the value from the source library variable
                    const variableValue = await allWorkers[instruction.libraryValue].getVariable(instruction.variableValue);
                    
                    // console.log("DEBUG value:", variableValue);
                    
                    // Set the variable in the target library
                    await allWorkers[instruction.library].setVariable(instruction.name, variableValue);

                    // console.log("DEBUG value:", variableValue);
                    // console.log("helio: " + await allWorkers[instruction.libraryValue].getVariable(instruction.name));
                    
                    // console.log("Assignment complete");
                }
                if(instruction.type == "IMPORT")
                {
                    //instrction library has to have a path to .local-offlinepm

                    //How to realy wait until a library is fully executed????
                    console.log("hi");
                    allWorkers[instruction.library] = new workerLib.LanguageWorker(instruction.lang, instruction.library + ".js");
                    
                    // Wait for library initialization
                    await new Promise(r => setTimeout(r, 200));
                }
                if(instruction.type == "CALL")
                {
                    await allWorkers[instruction.library].executeFunction(instruction.name);
                }
            // }
        }
        rl.close();
    }
}


const runtime = new Runtime();
runtime.interactiveMode();
// let inputFileString = fs.readFileSync(inputFile, 'utf8');
// console.log( fs.readFileSync(inputFile, 'utf8'));
// runtime.inputMode(inputFileString);
// console.log("hi");