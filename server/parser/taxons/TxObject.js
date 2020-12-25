const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')

class TxObject extends TxExpression {
    dict = {}
    items = []
    init(node) {
        let prevDivider = ''
        let curItem = []
        let dictKey = ''
        node.args.forEach(itemNode => {
            const taxon = this.addTaxon(itemNode.createTaxon())
            if (prevDivider !== ':') {
                curItem = [taxon]
                this.items.push(curItem)
                dictKey = (itemNode.txType === 'TxName' || itemNode.txType === 'TxConst') ? itemNode.value : ''
            } else {
                curItem.push(taxon)
            }
            if (dictKey) {
                this.dict[dictKey] = taxon
            }
            prevDivider = itemNode.stopper
        })
    }

    exportChunks(chunks, style) {
        chunks.push(Chunk.objBegin)
        this.items.forEach((item, j, all) => {
            const [key, value] = item
            key.exportChunks(chunks, style)
            if (value) {
                chunks.push(Chunk.colon)
                value.exportChunks(chunks, style)
            }
            chunks.push(j === all.length - 1 ? Chunk.itemDivLast : Chunk.itemDiv)
        })
        chunks.push(Chunk.objEnd)
    }
}

module.exports = {TxObject}