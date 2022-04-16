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

    findDeclarationDown(name) {
        for (let cmd of this.subTaxons) {
            const decl = cmd.findDeclarationDown(name)
            if (decl) return decl
        }
        return null
    }
}

module.exports = {TxBody}