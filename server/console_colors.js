const colors = {
        "black" : "30",
        "red" : "31",
        "green" : "32",
        "yellow" : "33",
        "blue" : "34",
        "purple" : "35",
        "lightblue" : "36",
        "white" : "37"
    }

function coloredText(text, color, bold = false){
    let bolded = bold ? `\x1b[1m` : "";
    return `${bolded}\x1b[${colors[color]}m${text}\x1b[0m`
}

module.exports = coloredText;