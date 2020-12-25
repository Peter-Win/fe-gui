const {Taxon} = require('./Taxon')
const {Chunk} = require('../Chunk')

class TxVarDecl extends Taxon {
    init(node) {
        this.declType = node.value
        this.subTaxons = node.args.map(cmdNode => this.addTaxon(cmdNode.createTaxon()))
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.keyword(this.declType), Chunk.space)
        this.subTaxons.forEach((item, j, arr) => {
            item.exportChunks(chunks, style)
            if (j < arr.length - 1) chunks.push(Chunk.itemDiv)
        })
    }
}

module.exports = {TxVarDecl}