const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxArray extends TxExpression {
    init(node) {
        node.args.
            // Будем считать, что исходники не имеют ошибок.
            // И отсутствие элемента означает последнюю запятую [a,b,c,]
            filter(itemNode => itemNode.txType).
            forEach(itemNode => this.addTaxon(itemNode.createTaxon()))
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.arrayBegin, Chunk.softUp)
        this.subTaxons.forEach((item, j, list) => {
            item.exportChunks(chunks, style)
            chunks.push(j === list.length - 1 ? Chunk.itemDivLast : Chunk.itemDiv)
            chunks.push(Chunk.softDiv)
        })
        chunks.push(Chunk.softDown, Chunk.arrayEnd)
    }
}

module.exports = {TxArray}