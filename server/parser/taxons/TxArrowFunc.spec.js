const {expect} = require('chai')
const {parseExpression} = require('../parseExpression')
const {ReaderCtx} = require('../ReaderCtx')
const {WriterCtx} = require('../WriterCtx')
const {Style} = require('../Style')

const parse = text => parseExpression(ReaderCtx.fromText(text)).createTaxon()
const write = (taxon, chunksOnly) => {
    const chunks = []
    const style = new Style()
    taxon.exportChunks(chunks, style)
    return chunksOnly ? chunks : WriterCtx.makeText(chunks, style)
}

describe('TxArrowFunc', () => {
    it('short without params', () => {
        expect(write(parse('() => null'))).to.equal('() => null')
    })
    it('short with params', () => {
        expect(write(parse('(x,y) => x+y'))).to.equal('(x, y) => x + y')
    })
    it('full without params', () => {
        expect(write(parse('() => {}'))).to.equal('() => {\n}')
    })
    it('full with params', () => {
        const src = '(x, y) => { const x2 = x * x, y2 = y*y; return x2+y2; }'
        const dst = '(x, y) => {\n  const x2 = x * x, y2 = y * y;\n  return x2 + y2;\n}'
        expect(write(parse(src), false)).to.equal(dst)
    })
})