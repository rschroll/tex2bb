function convert() {
    var input = document.getElementById("input").value;
    var italic = document.getElementById("italic").checked;
    var output = stringify(tokenize(input), italic);
    document.getElementById("htmloutput").innerHTML = output;
    document.getElementById("phpbboutput").innerHTML = output.replace(/</g, "[").replace(/>/g, "]");
    return false;
}

function autoconvert() {
    if (document.getElementById("auto").checked)
        return convert();
    return true;
}

function tokenize(string) {
    var tokens = [];
    for (var i=0; i<string.length; i++) {
        var token = string[i];
        if (token == "\\" && i+1 < string.length) {
            while (i+1 < string.length && isletter(string[i+1]))
                token += string[++i];
            if (token == "\\" && i+1 < string.length) // Non-letter followed backslash
                token += string[++i];
            while (i+1 < string.length && string[i+1] == " ")
                i += 1;
        }
        tokens.push(symbol(token));
    }
    return tokens;
}

function symbol(key) {
    var s = SYMBOLS[key];
    return (s === undefined) ? key : s;
}

function isletter(char) {
    var code = char.charCodeAt(0);
    return (64 < code && code < 91) || (96 < code && code < 123);
}

MARKUPS = {
    "_": "sub",
    "^": "sup",
    "\\mathit": "i",
    "\\mathbf": "b",
}

function stringify(tokens, italicize_latin) {
    var string = "";
    var pending = [];
    var bracket_close = [];
    for (var i=0; i<tokens.length; i++) {
        if ((tokens[i] == "_" || tokens[i] == "^") && string.substr(-1, 1) == " ") // U+202F
            string = string.slice(0,-1);
        
        var markup = MARKUPS[tokens[i]];
        if (markup !== undefined) {
            pending.push(markup);
            continue;
        }
        
        if (tokens[i] == "OPEN{") {
            bracket_close.push(pending);
            string += open_tags(pending);
            pending = [];
            continue;
        }
        
        if (tokens[i] == "CLOSE}") {
            if (bracket_close.length > 0)
                string += close_tags(bracket_close.pop());
            pending = []; // Should already be empty
            continue;
        }
        
        if (tokens[i].length == 1 && isletter(tokens[i]) && italicize_latin)
            pending.push("i");
        string += open_tags(pending) + tokens[i] + close_tags(pending);
        pending = [];
    }
    while (bracket_close.length > 0)
        string += close_tags(bracket_close.pop());
    return string;
}

function open_tags(pending) {
    return pending.length ? "<" + pending.join("><") + ">" : "";
}

function close_tags(pending) {
    return pending.length ? "</" + pending.reverse().join("></") + ">" : "";
}
