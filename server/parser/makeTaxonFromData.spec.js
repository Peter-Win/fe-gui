const {expect} = require('chai')
const { makeTaxonFromData } = require('./makeTaxonFromData')
const { Style } = require('./Style')

const style = new Style()
style.trailingComma = false
style.singleQuote = true

describe('makeTaxonFromData', () => {
    it('undefined', () => {
        expect(makeTaxonFromData().exportText(style)).to.equal('undefined')
    })
    it('null', () => {
        expect(makeTaxonFromData(null).exportText(style)).to.equal('null')
    })
    it('boolean', () => {
        expect(makeTaxonFromData(true).exportText(style)).to.equal('true')
        expect(makeTaxonFromData(false).exportText(style)).to.equal('false')
    })
    it('string', () => {
        const tx = makeTaxonFromData('Hello, world!', style)
        expect(tx.constType).to.equal('string')
        expect(tx.constValue).to.equal("'Hello, world!'")
        expect(tx.exportText(style)).to.equal(`'Hello, world!'`)
    })
    it('Array', () => {
        expect(makeTaxonFromData([]).exportText(style).replace(/\n/g, '')).to.equal('[]')
        expect(makeTaxonFromData([1]).exportText(style).replace(/\s/g, '')).to.equal(`[1]`)
        expect(makeTaxonFromData([1, 2, 3]).exportText(style).replace(/\s/g, '')).to.equal(`[1,2,3]`)
        expect(makeTaxonFromData(['a', 'b']).exportText(style).replace(/\s/g, '')).to.equal(`["a","b"]`)
    })
    it('Object', () => {
        expect(makeTaxonFromData({}).exportText(style).replace(/\s/g, '')).to.equal('{}')
        expect(makeTaxonFromData({id:1,name:'first'}).exportText(style).replace(/\s/g, '')).to.equal('{id:1,name:"first"}')
    })
})