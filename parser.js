function parseLine(lineInput, libraryName)
{
    let instruction = {};

    lineInput = cleanCode([lineInput]);

    if(lineInput.length > 0)
    {
        let line = lineInput[0];

        if(line.startsWith("IMPORT "))
        {
            let replacedLine = line.replaceAll(" ", "|").replaceAll("[", "|").replaceAll("]", "|");
            let splitLine = replacedLine.split("|");

            let lang = splitLine[2];
            let library = splitLine[4];

            instruction = {"type" : "IMPORT", "lang" : lang, "library" : library};
        }
        if(line.startsWith("ASSIGN "))
        {
            let replacedLine = line.replaceAll(" = ", "|").replaceAll(".", "|").replaceAll(" ", "|");
            let splitLine = replacedLine.split("|");

            let library = splitLine[1];
            let name = splitLine[2];
            let libraryValue = splitLine[3];
            let variableValue = splitLine[4];

            instruction = {"type" : "ASSIGN", "library" : library, "name" : name, "libraryValue" : libraryValue, "variableValue" : variableValue};
        }
        if(line.startsWith("VARIABLE "))
        {
            let replacedLineString = line.replaceAll('"', "|");
            let splitLineString = replacedLineString.split("|");

            let replacedLine = line.replaceAll(".", "|").replaceAll(" ", "|");
            let splitLine = replacedLine.split("|");

            let library = splitLine[1];
            let name = splitLine[2];
            let value = splitLineString[1];

            instruction = {"type" : "VARIABLE", "library" : libraryName, "name" : name, "value" : value};
        }
        if(line.startsWith("CALL "))
        {
            let replacedLine = line.replaceAll(".", "|").replaceAll(" ", "|");
            let splitLine = replacedLine.split("|");

            let library = splitLine[1];
            let name = splitLine[2];

            instruction = {"type" : "CALL", "library" : library, "name" : name};
        }
    }
    return instruction;
}

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

module.exports = {
    parseLine
}
