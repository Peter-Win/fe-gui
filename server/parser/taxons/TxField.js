const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxField extends TxExpression {
    init(node) {
        this.field = node.value
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.name(this.field))
    }
}
module.exports = {TxField}