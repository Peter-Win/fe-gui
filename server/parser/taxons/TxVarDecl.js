const {Taxon} = require('./Taxon')
const {Chunk} = require('../Chunk')

class TxVarDecl extends Taxon {
    init(node) {
        this.declType = node.value
        this.subTaxons = node.args.map(cmdNode => this.addTaxon(cmdNode.createTaxon()))
    }
    /**
     * @param {"var"|"let"|"const"} declType 
     * @param {TxBinOp} assignOp with opcode = "="
     */
    initCustom(declType, assignOp) {
        this.declType = declType
        this.addTaxon(assignOp)
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.keyword(this.declType), Chunk.space)
        this.subTaxons.forEach((item, j, arr) => {
            item.exportChunks(chunks, style)
            if (j < arr.length - 1) chunks.push(Chunk.itemDiv)
        })
    }

    findDeclarationDown(name) {
        return this.subTaxons.find(cmd => 
            cmd.type === 'TxBinOp' && cmd.opcode === '=' && cmd.left.type === 'TxName' && cmd.left.name === name
        )
    }
}

module.exports = {TxVarDecl}