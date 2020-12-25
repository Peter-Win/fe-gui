const {expect} = require('chai')
const {parseExpression} = require('../parseExpression')
const {ReaderCtx} = require('../ReaderCtx')

const makeNode = (text) => parseExpression(ReaderCtx.fromText(text))
const createConst = (text) => makeNode(text).createTaxon()

describe('TxConst', () => {
    it('string', () => {
        const tx1 = createConst("'Hello'")
        expect(tx1.constType).to.equal('string')
        expect(tx1.constValue).to.equal("'Hello'")

        const tx2 = createConst('  `x=${x}` ')
        expect(tx2.constType).to.equal('string')
        expect(tx2.constValue).to.equal('`x=${x}`')

        const tx3 = createConst('" A "')
        expect(tx3.constType).to.equal('string')
        expect(tx3.constValue).to.equal('" A "')
    })
    it('null', () => {
        const taxon = createConst('null')
        expect(taxon.constType).to.equal('null')
        expect(taxon.constValue).to.equal('null')
    })
    it('undefined', () => {
        const taxon = createConst('undefined')
        expect(taxon.constType).to.equal('undefined')
        expect(taxon.constValue).to.equal('undefined')
    })
    it('boolean', () => {
        const txTrue = createConst('true')
        expect(txTrue.constType).to.equal('boolean')
        expect(txTrue.constValue).to.equal('true')
        const txFalse = createConst('false')
        expect(txFalse.constType).to.equal('boolean')
        expect(txFalse.constValue).to.equal('false')
    })
    it('number', () => {
        const makeNum = text => {
            const node = createConst(text)
            return `${node.constValue}:${node.constType}`
        }
        expect(makeNum('1')).to.equal('1:number')
        expect(makeNum('1.2')).to.equal('1.2:number')
        expect(makeNum('-3.14')).to.equal('-3.14:number')
        expect(makeNum('-0.12e-6')).to.equal('-0.12e-6:number')
        expect(makeNum('0xFE')).to.equal('0xFE:number')
        expect(makeNum('NaN')).to.equal('NaN:number')
    })
})