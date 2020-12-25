const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxName extends TxExpression {
    init(node) {
        this.name = node.value
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.name(this.name))
    }
}
module.exports = {TxName}