const {Taxon} = require('./Taxon')
const {Chunk} = require('../Chunk')

class TxBody extends Taxon {
    init(node) {
        this.useBraces = node.value === '{'
        node.args.forEach(cmdNode => this.addTaxon(cmdNode.createTaxon()))
    }
    exportChunks(chunks, style) {
        if (this.useBraces) chunks.push(Chunk.bodyBegin)
        this.subTaxons.forEach(taxon => {
            taxon.exportChunks(chunks, style)
            chunks.push(Chunk.instrDiv)
        })
        if (this.useBraces) chunks.push(Chunk.bodyEnd)
    }
}

module.exports = {TxBody}