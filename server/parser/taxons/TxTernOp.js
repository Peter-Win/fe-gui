const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxTernOp extends TxExpression {
    init(node) {
        this.opcode = node.value
        this.prior = node.prior
        node.args.forEach(arg => this.addTaxon(arg.createTaxon()))
    }
    exportChunks(chunks, style) {
        const [condition, positive, negative] = this.subTaxons
        condition.exportChunks(chunks, style)
        chunks.push(Chunk.binop('?'))
        positive.exportChunks(chunks, style)
        chunks.push(Chunk.binop(':'))
        negative.exportChunks(chunks, style)
    }
}

module.exports = {TxTernOp}