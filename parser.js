function parse(codeString, libraryName)
{
    let instructions = [];


    let lines = intoLines(codeString);

    lines = cleanCode(lines);


    console.log(lines);


    for(let i = 0; i < lines.length; i++)
    {
        let line = lines[i];

        if(line.startsWith("IMPORT "))
        {
            let replacedLine = line.replaceAll(" ", "|").replaceAll("[", "|").replaceAll("]", "|");
            let splitLine = replacedLine.split("|");

            let lang = splitLine[2];
            let library = splitLine[4];


            instructions.push({"type" : "IMPORT", "lang" : lang, "library" : library});
        }
        if(line.startsWith("ASSIGN "))
        {
            let replacedLine = line.replaceAll(" = ", "|").replaceAll(".", "|").replaceAll(" ", "|");
            let splitLine = replacedLine.split("|");

            let library = splitLine[1];
            let name = splitLine[2];
            let libraryValue = splitLine[3];
            let variableValue = splitLine[4];


            instructions.push({"type" : "ASSIGN", "library" : library, "name" : name, "libraryValue" : libraryValue, "variableValue" : variableValue});
        }
        if(line.startsWith("VARIABLE "))
        {
            //maybe first replace All """" and get the string from that
            //then everything else
            let replacedLineString = line.replaceAll('"', "|");
            let splitLineString = replacedLineString.split("|");

            let replacedLine = line.replaceAll(".", "|").replaceAll(" ", "|");
            let splitLine = replacedLine.split("|");

            let library = splitLine[1];
            let name = splitLine[2];
            let value = splitLineString[1];


            instructions.push({"type" : "VARIABLE", "library" : library, "name" : name, "value" : value});
        }
        if(line.startsWith("DEFINE "))
        {
            let replacedLine = line.replaceAll(' ', "|");
            let splitLine = replacedLine.split("|");

            let library = libraryName;
            let name = splitLine[1];
            let body = [];


            i++;
            line = lines[i];
            while((!line.startsWith("END") && i < lines.length))
            {
                body.push(line);

                i++;
                line = lines[i];
            }


            instructions.push({"type" : "DEFINE", "library" : library, "name" : name, "body" : body});
        }
        if(line.startsWith("CALL "))
        {
            let replacedLine = line.replaceAll(".", "|").replaceAll(" ", "|");
            let splitLine = replacedLine.split("|");

            let library = splitLine[1];
            let name = splitLine[2];


            instructions.push({"type" : "CALL", "library" : library, "name" : name});
        }
    }
    console.log(instructions);
    return instructions;
}


// parse('IMPORT [py] console\n//what\n\nIMPORT [js] print\nASSIGN librrary.name = librarie.value\nVARIABLE lierary.nname = "heelio"\nCALL lihabahary.niamie\n\nDEFINE name\nCALL someshit\nagain some shit\nEND\nCALL names.nnnname\n', "testlib");

function cleanCode(lines)
{
    let cleanedLines = [];

    for(let i = 0; i < lines.length; i++)
    {
        let line = lines[i];

        trimmedLine = line.trim();

        if((trimmedLine != "" && trimmedLine != " " && !trimmedLine.startsWith("//")))
        {
            cleanedLines.push(trimmedLine);
        }
    }

    return cleanedLines;
}


function intoLines(codeString)
{
    return codeString.split("\n");
}



module.exports = {
    parse
}