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

export { TextDecompile };