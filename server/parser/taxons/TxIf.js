const { Taxon } = require("./Taxon")
const { Chunk } = require('../Chunk')

class TxIf extends Taxon {
    init(node) {
        node.args.forEach(cmdNode => this.addTaxon(cmdNode.createTaxon()))
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.keyword('if'), Chunk.bracketBegin)
        this.getCondition().exportChunks(chunks, style)
        chunks.push(Chunk.bracketEnd)
        this.getThen().exportChunks(chunks, style)
        if (this.getElse()) {
            chunks.push(Chunk.keyword('else'))
            this.getElse().exportChunks(chunks, style)
        }
    }
    getCondition() {
        return this.subTaxons[0]
    }
    getThen() {
        return this.subTaxons[1]
    }
    getElse() {
        return this.subTaxons[2]
    }
}

module.exports = { TxIf }