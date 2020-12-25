const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxArrayDestruct extends TxExpression {
    /** @type {(TxExpression|null)[]} pattern */
    pattern = []
    init(node) {
        this.pattern = node.args.map(item => !item || !item.txType ? null :
            this.addTaxon(item.createTaxon()))
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.arrayBegin)
        this.pattern.forEach((item, j, list) => {
            if (item) item.exportChunks(chunks, style)
            chunks.push(j === list.length - 1 ? Chunk.itemDivLast : Chunk.itemDiv)
        })
        chunks.push(Chunk.arrayEnd)
    }
}

module.exports = {TxArrayDestruct}