function parseLine(lineInput)
{
    let instruction = {};
    
    let trimmed = lineInput.trim();
    
    if(trimmed.startsWith("IMPORT "))
    {
        let splitLine = splitBy(trimmed, " ", "[", "]");

        let lang = splitLine[2];
        let library = splitLine[4];

        instruction = {"type" : "IMPORT", "lang" : lang, "library" : library};
    }
    if(trimmed.startsWith("ASSIGN "))
    {
        let splitLine = splitBy(trimmed, " = ", ".", " ");

        let library = splitLine[1];
        let name = splitLine[2];
        let libraryValue = splitLine[3];
        let variableValue = splitLine[4];

        instruction = {"type" : "ASSIGN", "library" : library, "name" : name, "libraryValue" : libraryValue, "variableValue" : variableValue};
    }
    if(trimmed.startsWith("VARIABLE "))
    {
        let parts = splitBy(trimmed, " = ");
        let leftSide = parts[0];
        let rightSide = parts[1];

        let leftParts = splitBy(leftSide, "VARIABLE ", ".");
        let library = leftParts[1];
        let name = leftParts[2];

        let valueParts = splitBy(rightSide, '"');
        let value = valueParts[1];

        instruction = {"type" : "VARIABLE", "library" : library, "name" : name, "value" : value};
    }
    if(trimmed.startsWith("CALL "))
    {
        let splitLine = splitBy(trimmed, ".", " ");

        let library = splitLine[1];
        let name = splitLine[2];

        instruction = {"type" : "CALL", "library" : library, "name" : name};
    }
    return instruction;
}

function splitBy(text, ...replacements) {
    for (let i = 0; i < replacements.length; i++) {
        text = text.replaceAll(replacements[i], "|");
    }
    return text.split("|");
}

module.exports = {
    parseLine
}
