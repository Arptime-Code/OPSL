function parse(lines)
{
    const instructions = [];


    lines = trimLines(lines);


    //DEFINE
    for(let i = 0; i < lines.length; i++)
    {
        let line = lines[i];

        if(line.startsWith("DEFINE "))
        {
            // Split after "DEFINE " to separate name from parameters
            const afterDefine = line.slice(7);
            const nameAndParams = afterDefine.split("(");
            
            const functionName = nameAndParams[0].trim();
            
            // Get everything between ( and ) for parameters
            const paramsAndRest = nameAndParams[1].split(")");
            const rawParams = paramsAndRest[0].trim();
            
            // Split parameters by comma
            const paramStrings = rawParams.split(",");
            const params = [];
            for (let j = 0; j < paramStrings.length; j++) {
                const paramName = paramStrings[j].trim();
                if (paramName) params.push(paramName);
            }

            // Parse body until }
            const bodyLines = [];
            const startLine = i;
            i += 2;

            while (i < lines.length) {
                const bodyLine = lines[i].trim();
                if (bodyLine === "}") break;
                if (bodyLine && !bodyLine.startsWith("//")) bodyLines.push(bodyLine);
                i++;
            }
            instructions.push({ type:"DEFINE", name: functionName, params, body: bodyLines, line: startLine });
            continue;
        }
        if(line.startsWith("IMPORT "))
        {
            const splitAtSpaces = line.split(" ");
            const libraryName = splitAtSpaces[2];
            const languageName = splitAtSpaces[1].split("[").join("").split("]").join("");

            instructions.push({ type:"IMPORT", languageName, libraryName, line: i });
        }
        if (line.startsWith("return ")) {
            const rest = line.slice(7).trim();
            const values = rest.split(",");
            instructions.push({ type: "RETURN", values, line: i });
        }


        //Function calls
        if((line.includes(".") && line.includes(" = ") && line.includes("(") && line.includes(")") && !line.includes("DEFINE ")))
        {
            const splitLine = splitFunction(line);
            const targets = splitLine[0];
            const library = splitLine[1];
            const fn = splitLine[2];
            const args = tokenizeArgs(splitLine[3]);
            instructions.push({ type:"ASSIGN", targets, library, fn, args, line:i });
        }
        if((line.includes(".") && !line.includes(" = ") && line.includes("(") && line.includes(")") && !line.includes("DEFINE ")))
        {
            const splitLine = splitFunction(line);
            const targets = "";
            const library = splitLine[0];
            const fn = splitLine[1];
            const args = tokenizeArgs(splitLine[2]);
            instructions.push({ type:"CALL", targets, library,fn, args, line:i });
        }
        //Local function calls without lib
        if((!line.includes(".") && line.includes(" = ") && line.includes("(") && line.includes(")") && !line.includes("DEFINE ")))
        {
            const splitLine = splitFunction(line);
            const targets = splitLine[0];
            const fn = splitLine[1];
            const args = tokenizeArgs(splitLine[2]);
            instructions.push({ type:"LOCAL_ASSIGN", targets,fn,args, line:i });
        }
        if((!line.includes(".") && !line.includes(" = ") && line.includes("(") && line.includes(")") && !line.includes("DEFINE ")))
        {
            const splitLine = splitFunction(line);
            const targets = "";
            const fn = splitLine[0];
            const args = tokenizeArgs(splitLine[1]);
            instructions.push({ type:"LOCAL_CALL", targets,fn,args, line:i });
        }
    }


    return instructions;
}




function tokenizeArgs(raw)
{
    let tokens = [];

    let lastStringCut = 0;


    let curlyBraces = 0;
    let squareBraces = 0;
    let doubleQuote = false;
    for(let i = 0; i < raw.length; i++)
    {
        switch(raw[i])
        {
            case "[":
                squareBraces += 1;
                break;
            case "{":
                curlyBraces += 1;
                break;
            case '"':
                doubleQuote = !doubleQuote;
                break;
            case "}":
                curlyBraces -= 1;
                break;
            case "]":
                squareBraces -= 1;
                break;
        }

        if((squareBraces === 0 && curlyBraces === 0 && doubleQuote === false && raw[i] === ","))
        {
            tokens.push(raw.substring(lastStringCut, i));
            lastStringCut = i + 1;
        }
    }
    if((squareBraces === 0 && curlyBraces === 0 && doubleQuote === false))
    {
        tokens.push(raw.substring(lastStringCut, raw.length));
    }
    return tokens
}




function splitFunction(line)
{
    const splitLine = line.replaceAll(" = ", "|").replaceAll(".", "|").replaceAll("(", "|").replaceAll(")", "").split("|");

    return splitLine
}



function trimLines(lines)
{
    let newLines = [];
    for(let i = 0; i < lines.length; i++) {
        const line = lines[i].trim(); // <-- trim FIRST, every time


        if(!line || line.startsWith("//")) { continue; }
        
        newLines.push(line);
    }
    console.log(newLines);
    return newLines;
}


module.exports = {
    parse
}