"use strict"
const namedConsts = new Set(['true', 'false', 'null', 'undefined', 'NaN'])
const namedOps = new Set(['instanceof', 'in', 'typeof', 'await', 'async', 'new', 'delete'])
const {opcodeMap} = require('./operators')

class ParserNode {
    /**
     * @param {{value:string, type:string}} lex
     */
    constructor(lex, txType = '') {
        this.lexType = lex.type
        this.value = lex.value
        this.args = []
        this.prior = 0
        this.txType = txType // TxConst, TxName, TxBrackets, TxFnCall, TxFnDecl, TxBinOp ...
        this.opcode = null
        this.stopper = '' // Команда остановки
    }
    isOp = () => this.lexType === 'cmd' || (this.lexType === 'id' && namedOps.has(this.value))

    isArg = () => this.lexType === 'number' || this.lexType === 'string' ||
        (this.lexType === 'id' && !namedOps.has(this.value))

    setArgType() {
        if (this.lexType === 'number' || this.lexType === 'string') {
            this.txType = 'TxConst'
        } else if (this.lexType === 'id') {
            this.txType = namedConsts.has(this.value) ? 'TxConst' : 'TxName'
        }
    }

    toString() {
        let s = `${this.txType}:${this.value}`
        if (this.args.length > 0) {
            s += ` (${this.args.map(a => a.toString()).join(', ')})`
        }
        return s
    }

    /** @param {ReaderCtx} reader */
    initOp(reader, canWrong = false) {
        const opcode = this.opcode || this.value
        const descr = opcodeMap.get(opcode)
        if (!descr) {
            if (canWrong) return false
            reader.error(`Invalid operation "${this.value}"`)
        }
        const [, txType, prior] = descr
        this.txType = txType
        this.prior = prior
        return true
    }

    checkTaxonType() {
        const {txType} = this
        if (txType === 'TxBinOp' && this.value === '=') {
            const [left] = this.args
            if (left.txType === 'TxArray') {
                left.txType = 'TxArrayDestruct'
            } else if (left.txType === 'TxObject') {
                left.txType = 'TxObjectDestruct'
            }
        } else if (txType in {TxArrayDestruct: 1, TxObjectDestruct: 1}) {
            this.args.forEach(arg => {
                if (arg.txType === 'TxArray') {
                    arg.txType = 'TxArrayDestruct'
                } else if (arg.txType === 'TxObject') {
                    arg.txType = 'TxObjectDestruct'
                }
            })
        }
    }

    createTaxon() {
        const {createTaxonByType} = require('./taxons/all')
        this.checkTaxonType()
        if (!this.txType) {
            throw new Error(`Empty txType for ${this.lexType}:${this.value}`)
        }
        const taxon = createTaxonByType(this.txType)
        taxon.type = this.txType
        taxon.init(this)
        return taxon
    }
}

module.exports = {ParserNode}