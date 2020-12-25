const {Taxon} = require('./Taxon')
const {Chunk} = require('../Chunk')

class TxArguments extends Taxon {
    init(node) {
        node.args.forEach(argNode => this.addTaxon(argNode.createTaxon()))
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.paramsBegin)
        this.subTaxons.forEach((argTaxon, j, arr) => {
            argTaxon.exportChunks(chunks, style)
            chunks.push(j === arr.length - 1 ? Chunk.paramDivLast : Chunk.paramDiv)
        })
        chunks.push(Chunk.paramsEnd)
    }
}

module.exports = {TxArguments}