const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxUnOp extends TxExpression {
    init(node) {
        this.opcode = node.value
        this.prior = node.prior
        this.addTaxon(node.args[0].createTaxon())
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.unop(this.opcode))
        if (/^[a-z]+$/.test(this.opcode)) chunks.push(Chunk.space)
        this.subTaxons[0].exportChunks(chunks, style)
    }
}
module.exports = {TxUnOp}