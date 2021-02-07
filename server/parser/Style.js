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
        const escaped = value.replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
        const unquoted = this.singleQuote ? escaped.replace(/\'/g, '\\\'') : escaped.replace(/\"/g, '\\\"')
        return this.singleQuote ? `'${unquoted}'` : `"${unquoted}"`
    }
}

module.exports = {Style}