const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxConst extends TxExpression {
    constValue = ''
    constType = '' // 'number' | 'string' | 'boolean' | 'undefined' | 'regexp'
    static create(type, value) {
        const inst = new TxConst()
        inst.constType = type
        inst.constValue = value
        return inst
    }
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
        chunks.push(Chunk.Const(this.constValue, this.constType))
    }
    getRealValue() {
        const value = this.constValue
        switch (this.constType) {
            case 'number':
                return +value
            case 'boolean':
                return value !== 'false'
            case 'undefined':
                return undefined
            case 'null':
                return null
            case 'regexp':
            {
                const lastDiv = value.lastIndexOf('/')
                return new RegExp(value.slice(1, lastDiv), value.slice(lastDiv+1))
            }
        }
        return value
    }
}

module.exports = {TxConst}