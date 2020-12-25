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
        return step.repeat(level)
    }
}

module.exports = {Style}