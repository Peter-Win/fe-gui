const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxIndex extends TxExpression {
    init(node) {
        node.args.forEach(arg => this.addTaxon(arg.createTaxon()))
    }
    getContainerArg() {
        return this.subTaxons[0]
    }
    getIndexArg() {
        return this.subTaxons[1]
    }
    exportChunks(chunks, style) {
        this.getContainerArg().exportChunks(chunks, style)
        chunks.push(Chunk.arrayBegin)
        this.getIndexArg().exportChunks(chunks, style)
        chunks.push(Chunk.arrayEnd)
    }
}

module.exports = {TxIndex}