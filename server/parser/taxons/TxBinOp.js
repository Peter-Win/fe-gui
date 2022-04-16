const {TxExpression} = require('./TxExpression')
const {Chunk} = require('../Chunk')
const {opcodeMap} = require('../operators')

class TxBinOp extends TxExpression {
    init(node) {
        this.opcode = node.value
        this.prior = node.prior
        this.left = this.addTaxon(node.args[0].createTaxon())
        this.right = this.addTaxon(node.args[1].createTaxon())
    }
    initCustom(opcode, left, right, prior = null) {
        this.opcode = opcode
        if (prior) {
            this.prior = prior
        } else {
            const def = opcodeMap[opcode]
            this.prior = def ? def[2] : 0
        }
        this.left = this.addTaxon(left)
        this.right = this.addTaxon(right)
    }
    setLeft(left) {
        this.left = this.addTaxon(left)
    }
    setRight(right) {
        this.right = this.addTaxon(right)
    }

    exportChunks(chunks, style) {
        this.left.exportChunks(chunks, style)
        if (this.opcode === '.') {
            chunks.push(Chunk.dot)
        } else {
            chunks.push(Chunk.binop(this.opcode))
        }
        this.right.exportChunks(chunks, style)
    }
}
module.exports = {TxBinOp}