const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxBrackets extends TxExpression {
    init(node) {
        this.addTaxon(node.args[0].createTaxon())
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.bracketBegin)
        this.subTaxons[0].exportChunks(chunks, style)
        chunks.push(Chunk.bracketEnd)
    }
}
module.exports = {TxBrackets}