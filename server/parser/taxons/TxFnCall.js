const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxFnCall extends TxExpression {
    init(node) {
        node.args.forEach(paramNode => this.addTaxon(paramNode.createTaxon()))
    }
    getCaller() {
        return this.subTaxons[0]
    }
    getArgs() {
        return this.subTaxons.slice(1)
    }
    exportChunks(chunks, style) {
        this.getCaller().exportChunks(chunks, style)
        chunks.push(Chunk.paramsBegin)
        this.getArgs().forEach((param, j, list) => {
            param.exportChunks(chunks, style)
            chunks.push(j === list.length - 1 ? Chunk.paramDivLast : Chunk.paramDiv)
        })
        chunks.push(Chunk.paramsEnd)
    }
}

module.exports = {TxFnCall}