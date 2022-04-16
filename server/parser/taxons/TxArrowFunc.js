const { TxExpression } = require('./TxExpression')
const { Chunk } = require('../Chunk')

class TxArrowFunc extends TxExpression {
    init(node) {
        // node args: [TxArguments, TxBody|TxExpression]
        node.args.forEach(arg => this.addTaxon(arg.createTaxon()))
    }
    exportChunks(chunks, style) {
        this.getArgs().exportChunks(chunks, style)
        chunks.push(Chunk.binop('=>'))
        this.getBody().exportChunks(chunks, style)
    }
    getArgs() {
        return this.subTaxons[0]
    }
    getBody() {
        return this.subTaxons[1]
    }
    isShort() {
        return this.getBody().type !== 'TxBody'
    }
}

module.exports = {TxArrowFunc}