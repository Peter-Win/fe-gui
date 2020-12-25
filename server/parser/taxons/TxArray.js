const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxArray extends TxExpression {
    init(node) {
        node.args.forEach(itemNode => this.addTaxon(itemNode.createTaxon()))
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.arrayBegin)
        this.subTaxons.forEach((item, j, list) => {
            item.exportChunks(chunks, style)
            chunks.push(j === list.length - 1 ? Chunk.itemDivLast : Chunk.itemDiv)
        })
        chunks.push(Chunk.arrayEnd)
    }
}

module.exports = {TxArray}