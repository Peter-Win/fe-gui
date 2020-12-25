const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxBinOp extends TxExpression {
    init(node) {
        this.opcode = node.value
        this.prior = node.prior
        this.left = this.addTaxon(node.args[0].createTaxon())
        this.right = this.addTaxon(node.args[1].createTaxon())
    }
    exportChunks(chunks, style) {
        this.left.exportChunks(chunks, style)
        if (this.opcode === '.') {
            chunks.push(Chunk.dot)
        } else {
            chunks.push(Chunk.binop(this.opcode))
        }
        this.right.exportChunks(chunks, style)
    }
}
module.exports = {TxBinOp}