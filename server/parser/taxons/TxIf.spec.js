const {expect} = require('chai')
const {parseInstruction} = require('../parseExpression')
const {ReaderCtx} = require('../ReaderCtx')
const {WriterCtx} = require('../WriterCtx')
const {Style} = require('../Style')

const parse = text => {
    const node = parseInstruction(ReaderCtx.fromText(text))
    return node.createTaxon()
}
const write = (taxon, chunksOnly) => {
    const chunks = []
    const style = new Style()
    taxon.exportChunks(chunks, style)
    return chunksOnly ? chunks : WriterCtx.makeText(chunks, style)
}

describe('TxIf', () => {
    it('if-then', () => {
        const src = `if (x < 0) {return 0;}`
        expect(write(parse(src))).to.equal(`if (x < 0) {\n  return 0;\n}`)
    })
    it('if-then-else', () => {
        const src = `if (x < 0) {return 0;} else {return x;}`
        expect(write(parse(src))).to.equal('if (x < 0) {\n  return 0;\n} else {\n  return x;\n}')
    })
})