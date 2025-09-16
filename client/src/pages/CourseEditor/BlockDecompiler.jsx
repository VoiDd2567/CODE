const TextDecompile = (value) => {
    let result = value;

    result = result.replace(/<text([^>]*)>/g, (match, attributes) => {
        if (!attributes.trim()) return "<span>";

        let styleObj = {}
        const attrs = attributes.trim().split(/\s+/);

        attrs.forEach(attr => {
            if (attr.includes(":")) {
                const [key, value] = attr.split(":")
                styleObj[key] = value;
            }
        })

        const styleEntries = Object.entries(styleObj).map(([key, val]) => `${key}:${val}`);
        const styleString = `${styleEntries.join(';')}`;

        return `<span style=${styleString}>`;
    })
    result = result.replace(/<\/text>/g, "</span>")
    return result
}

const TextCompile = (value) => {
    let result = value;

    result = result.replace(/<span([^>]*)>/g, (match, attributes) => {
        if (!attributes.trim()) return "<text>";

        let styles = "";
        const styleMatch = attributes.match(/style\s*=\s*["']?([^"'>]*)["']?/);

        if (styleMatch) {
            styles = styleMatch[1]
                .split(";")
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .join(" ");
        }

        return `<text${styles ? " " + styles : ""}>`;
    });

    result = result.replace(/<\/span>/g, "</text>");
    return result;
};

export { TextDecompile, TextCompile };