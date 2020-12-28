const {TxExpression} = require('./TxExpression')
const {TxName} = require('./TxName')
const {Chunk} = require('../Chunk')

class TxObject extends TxExpression {
    dict = {}
    items = []
    init(node) {
        let prevDivider = ''
        let curItem = null
        let dictKey = ''
        node.args.forEach((itemNode, j, arr) => {
            if (!itemNode.lexType) {
                // trailing comma
                return
            }
            const taxon = this.addTaxon(itemNode.createTaxon())
            if (prevDivider !== ':') {
                curItem = {key: taxon}
                this.items.push(curItem)
                dictKey = (itemNode.txType === 'TxName' || itemNode.txType === 'TxConst') ? itemNode.value : ''
            } else {
                curItem.value = taxon
            }
            if (dictKey) {
                this.dict[dictKey] = taxon
            }
            prevDivider = itemNode.stopper
        })
    }

    exportChunks(chunks, style) {
        chunks.push(Chunk.objBegin, Chunk.softUp)
        this.items.forEach((item, j, all) => {
            const {key, value} = item
            key.exportChunks(chunks, style)
            if (value) {
                chunks.push(Chunk.colon)
                value.exportChunks(chunks, style)
            }
            chunks.push(j === all.length - 1 ? Chunk.itemDivLast : Chunk.itemDiv, Chunk.softDiv)
        })
        chunks.push(Chunk.softDown, Chunk.objEnd)
    }

    /**
     * @param {string} name
     * @param {Taxon?} value
     */
    addObjectItem(name, value) {
        const keyTaxon = this.addTaxon(new TxName({name}))
        this.dict[name] = value || keyTaxon
        const rec = {key: keyTaxon}
        if (value) rec.value = value
        this.items.push(rec)
    }
}

module.exports = {TxObject}