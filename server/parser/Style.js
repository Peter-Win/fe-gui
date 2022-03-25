class Style {
    printWidth = 120
    tabWidth = 2
    useTabs = false
    semi = true
    singleQuote = false
    trailingComma = true
    bracketSpacing = true
    arrowParens = 'always' // <always|avoid>

    indent(level) {
        const step = this.useTabs ? '\t' : ' '.repeat(this.tabWidth)
        return step.repeat(Math.max(0, level))
    }
    string(value) {
        let escaped=''
        for (let i=0; i<value.length; i++) {
            const c = value[i]
            if (c in escapeMap) {
                escaped += escapeMap[c]
            } else if (c==="'" && this.singleQuote) {
                escaped += "\\'"
            } else if (c==='"' && !this.singleQuote) {
                escaped += '\\"'
            } else {
                escaped += c
            }
        }
        return this.singleQuote ? `'${escaped}'` : `"${escaped}"`
    }
}

const escapeMap = {
    '\t': '\\t',
    '\n': '\\n',
    '\r': '\\r',
    '\\': '\\\\',
}

module.exports = {Style}