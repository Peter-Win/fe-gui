const relativeSpace = {
    'bracketEnd bodyBegin': ' ',
    'paramsEnd bodyBegin': ' ',
    'bodyEnd keyword': ' ',
}
class WriterCtx {
    /**
     * @param {string[][]} chunks
     * @param {Style} style
     */
    static makeText(chunks, style) {
        const writer = new WriterCtx(chunks, style)
        writer.buildLines()
        return writer.toString()
    }
    /**
     * @param {string[][]} chunks
     * @param {Style} style
     */
    constructor(chunks, style) {
        this.chunks = chunks
        this.style = style
        /** @type {string[]} */
        this.lines = []
        this.pos = 0
        this.level = 0
    }
    toString() {
        return this.lines.join('\n')
    }
    buildLines() {
        let prevType = ''
        while (this.pos < this.chunks.length) {
            const [value, type] = this.chunks[this.pos++]
            const pairKey = `${prevType} ${type}`
            const space = relativeSpace[pairKey]
            if (space) this.out(space)
            // if (prevType === 'keyword' && !!this.lines[this.lines.length - 1]) this.out(' ')
            if (prevType === 'keyword' && !(type in {space:1, eol:1})) {
                this.out(' ')
            }
            if (type === 'instrDiv') {
                if (this.style.semi) {
                    if (prevType !== 'bodyEnd') this.out(value)
                }
                this.addLine()
            } else if (type === 'bodyBegin') {
                this.out(value)
                this.level++
                this.addLine()
            } else if (type === 'bodyEnd') {
                this.level--
                this.out(value)
            } else if (type === 'softUp') {
                this.level++
                this.addLine()
            } else if (type == 'softDown') {
                // this.addLine()
                this.level--
            } else if (type === 'softDiv') {
                this.addLine()
            } else if (type === 'itemDivLast' && this.style.trailingComma) {
                // TODO: считаем, что каждый элемент объекта в отдельной строке
                this.out(',')
            } else if (type === 'itemDiv') {
                this.out(value.trimRight())
            } else {
                this.out(value)
            }
            prevType = type
        }
    }
    addLine() {
        this.lines.push('')
    }
    out(value) {
        if (value.length === 0) return
        const {lines} = this
        if (lines.length === 0) this.addLine()
        const last = lines.length - 1
        if (lines[last].length === 0) {
            lines[last] += this.style.indent(this.level)
        }
        lines[last] += value
    }
}

/**
 * @param {string[][]} chunks
 * @param {Style} style
 * @return {string}
 */
const formatChunks = (chunks, style) => WriterCtx.makeText(chunks, style)

module.exports = {WriterCtx, formatChunks}