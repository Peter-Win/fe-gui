const {expect} = require('chai')
const {loadTemplate} = require('../sysUtils/loadTemplate')
const {ReaderCtx} = require('../parser/ReaderCtx')
const {parseExpression, parseModule} = require('../parser/parseExpression')

it('Parse cssForWebpack', async () => {
    const text = await loadTemplate('cssForWebpack.js')
    const node = parseExpression(ReaderCtx.fromText(text))
    expect(node.txType).to.equal('TxObject')
    const taxon = node.createTaxon()
    expect(taxon.type).to.equal('TxObject')
})
