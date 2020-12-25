const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxPostfix extends TxExpression {
    init(node) {
        this.opcode = node.value
        this.prior = node.prior
        this.addTaxon(node.args[0].createTaxon())
    }
    getArg() {
        return this.subTaxons[0]
    }
    exportChunks(chunks, style) {
        this.getArg().exportChunks(chunks, style)
        chunks.push(Chunk.unop(this.opcode))
    }
}

module.exports = {TxPostfix}