const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxConst extends TxExpression {
    constValue = ''
    constType = '' // 'number' | 'string' | 'boolean' | 'undefined' | 'regexp'
    init(node) {
        const {value} = node
        this.constValue = value
        if (['\'', '"', '`'].includes(value[0])) {
            this.constType = 'string'
        } else if (value[0] === '/') {
            this.constType = 'regexp'
        } else if (/^[-\d\.]$/.test(value[0]) || value === 'NaN') {
            this.constType = 'number'
        } else if (value === 'true' || value === 'false') {
            this.constType = 'boolean'
        } else if (value === 'undefined') {
            this.constType = 'undefined'
        } else if (value === 'null') {
            this.constType = 'null'
        }
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.Const(this.constValue))
    }
}

module.exports = {TxConst}