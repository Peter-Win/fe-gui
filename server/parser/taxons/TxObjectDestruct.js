const {TxExpression} = require('./TxExpression')
const {TxBinOp} = require('./TxBinOp')
const {TxName} = require('./TxName')
const {Chunk} = require('../Chunk')

/**
 * @param {{prop:TxExpression,assignment:TxExpression|undefined,defaultValue:TxExpression|undefined}} item
 * @return {TxName|null}
 */

class ObjectAssignment {
    /** @type {TxExpression} */
    prop
    /** @type {TxExpression|null} */
    assignment = null
    /** @type {TxExpression|null} */
    defaultValue = null
    constructor(prop) {
        this.prop = prop
    }
    /** @return {TxName|null} */
    getVarName() {
        if (this.assignment instanceof TxName) return this.assignment
        if (this.prop instanceof TxName) return this.prop
        return null
    }
}

class TxObjectDestruct extends TxExpression {
    /**
     * @type {ObjectAssignment[]}
     */
    items = []
    init(node) {
        let prevDivider = ''
        let curItem
        node.args.forEach(curNode => {
            if (!curNode.txType) return
            const taxon = this.addTaxon(curNode.createTaxon())
            if (prevDivider !== ':') {
                curItem = new ObjectAssignment(taxon)
                this.items.push(curItem)
            } else {
                curItem.assignment = taxon
            }
            prevDivider = curNode.stopper
        })
        this.items.forEach(item => {
            if (!item.assignment && item.prop instanceof TxBinOp && item.prop.opcode === '=') {
                item.defaultValue = item.prop.right
                item.prop = item.prop.left
            } else if (item.assignment instanceof TxBinOp && item.assignment.opcode === '=') {
                item.defaultValue = item.assignment.right
                item.assignment = item.assignment.left
            }
        })
    }
    exportChunks(chunks, style) {
        chunks.push(Chunk.objBegin)
        this.items.forEach(({prop, assignment, defaultValue}, j, arr) => {
            prop.exportChunks(chunks, style)
            if (assignment) {
                chunks.push(Chunk.colon)
                assignment.exportChunks(chunks, style)
            }
            if (defaultValue) {
                chunks.push(Chunk.binop('='))
                defaultValue.exportChunks(chunks, style)
            }
            chunks.push(j === arr.length - 1 ? Chunk.itemDivLast : Chunk.itemDiv)
        })
        chunks.push(Chunk.objEnd)
    }
    getAllVars() {
        return this.items.map(item => item.getVarName()).filter(txName => txName)
    }
}

module.exports = {TxObjectDestruct, ObjectAssignment}