const { Taxon } = require("./Taxon")
const { Chunk } = require('../Chunk')

class TxReturn extends Taxon {
    init(node) {
        node.args.forEach(arg => this.addTaxon(arg.createTaxon()))
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.keyword('return'))
        if (this.subTaxons.length > 0) chunks.push(Chunk.space)
        this.subTaxons.forEach(tx => tx.exportChunks(chunks, style))
    }
}

module.exports = { TxReturn }