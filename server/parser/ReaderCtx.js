const {parseLexems} = require('./parseLexems')
const {skipLexem} = require('./skipLexem')

class ReaderCtx {
    lexems = []
    curPos = 0

    setText(text) {
        this.lexems = parseLexems(text)
        this.curPos = 0
    }

    static fromText(text) {
        const reader = new ReaderCtx()
        reader.setText(text)
        return reader
    }

    /**
     * Считать очередную лексему
     * @return {null|{value: string, type:'id'|'cmd'|'number'|'string'|'regexp'|'comment'|'space'|'eol'}}
     */
    readLexem() {
        if (this.curPos >= this.lexems.length) {
            return null
        }
        return this.lexems[this.curPos++]
    }
    getNextLexem(step = 1) {
        let start = this.curPos
        if (step === 0) {
            start--
            step = 1
        }
        const pos = skipLexem(this.lexems, start, step)
        return pos === -1 ? null : this.lexems[pos]
    }
    backToBeginOfLine() {
        while (this.curPos !== 0) {
            if (this.lexems[this.curPos - 1].type === 'eol') break
            this.curPos--
        }
    }
    getPos() {
        return this.curPos
    }
    seek(pos) {
        this.curPos = pos
    }
    error(msg) {
        throw new Error(msg)
    }
}
module.exports = {ReaderCtx}