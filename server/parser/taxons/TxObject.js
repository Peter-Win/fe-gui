const {TxExpression} = require('./TxExpression')
const {TxName} = require('./TxName')
const {TxConst} = require('./TxConst')
const {Chunk} = require('../Chunk')
const {isValidName} = require('../isValidName')
const { Style } = require('../Style')

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
     * @param {Style?} style
     */
    addObjectItem(name, value, style) {
        const keyTaxon = this.addTaxon(createKeyTaxon(name, style))
        this.dict[name] = value || keyTaxon
        const rec = {key: keyTaxon}
        if (value) rec.value = value
        this.items.push(rec)
    }

    /**
     * @param {string} name
     * @param {Taxon} value
     * @param {Style?} style
     */
    changeObjectItem(name, value, style) {
        if (!(name in this.dict)) {
            this.addObjectItem(name, value, style)
        } else {
            this.dict[name] = value
            const rec = this.items.find(({key}) => key === name)
            if (rec) rec.value = value
        }
    }
    deleteItem(name) {
        delete this.dict[name]
        this.items = this.items.filter(({key}) => key === name)
    }
}

/**
 * Создать таксон для ключа в объекте из имени
 * Делается различие для случаев, когда ключ соответствует правилам имени.
 * Например: camelCase -> TxName, snake_case -> TxName, kebeb-case -> TxConst
 * @param {string} name 
 * @param {Style?} style 
 * @returns {Taxon}
 */
const createKeyTaxon = (name, style) => {
    style = style || new Style()
    return isValidName(name) ? new TxName({name}) : TxConst.create('string', style.string(name))
}

module.exports = {TxObject, createKeyTaxon}