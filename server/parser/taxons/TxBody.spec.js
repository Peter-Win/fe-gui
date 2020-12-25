const {expect} = require('chai')
const {parseBody} = require('../parseExpression')
const {ReaderCtx} = require('../ReaderCtx')
const {ParserNode} = require('../ParserNode')
const {Style} = require('../Style')
const {chunks2text} = require('../Chunk')

const parse = text => {
    const node = new ParserNode({value:'', type:''}, 'TxBody')
    node.args = parseBody(ReaderCtx.fromText(text), '')
    return node.createTaxon()
}
const write = taxon => {
    const chunks = []
    taxon.exportChunks(chunks, new Style())
    return chunks2text(chunks)
}

describe('TxBody', () => {
    it('var declaration', () => {
        const txBody = parse('const a = 23; let b = 32,c')
        expect(write(txBody)).to.equal('const a = 23;let b = 32, c;')
    })
    it('equ', () => {
        const txBody = parse('module.exports = {TxBody}')
        expect(write(txBody)).to.equal('module.exports = {TxBody};')
    })
})