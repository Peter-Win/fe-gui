const {expect} = require('chai')
const {createKeyTaxon} = require('./TxObject')
const {Style} = require('../Style')
const {TxName} = require('./TxName')
const {TxConst} = require('./TxConst')

const singleQuote = new Style()
singleQuote.singleQuote = true
const doubleQuote = new Style()
doubleQuote.singleQuote = false

describe('createKeyTaxon', () => {
    it("Normal", () => {
        const tx1 = createKeyTaxon("Hello", singleQuote)
        const tx2 = createKeyTaxon("Hello", doubleQuote)
        expect(tx1).instanceOf(TxName)
        expect(tx1.name).to.equal('Hello')
        expect(tx2).instanceOf(TxName)
        expect(tx2.name).to.equal('Hello')
    })
    it("Kebab", () => {
        const tx1 = createKeyTaxon("kebab-case", singleQuote)
        const tx2 = createKeyTaxon("kebab-case", doubleQuote)
        expect(tx1).instanceOf(TxConst)
        expect(tx1.constValue).to.equal("'kebab-case'")
        expect(tx2).instanceOf(TxConst)
        expect(tx2.constValue).to.equal('"kebab-case"')
    })
    it("Escaped", () => {
        const tx1 = createKeyTaxon("\\.A\n", singleQuote)
        const tx2 = createKeyTaxon("\\.A\n", doubleQuote)
        expect(tx1).instanceOf(TxConst)
        expect(Array.from(tx1.constValue)).have.lengthOf(8)
        expect(Array.from(tx1.constValue)).to.deep.equal(["'", '\\', '\\', '.', 'A', '\\', 'n', "'"])
        expect(tx2).instanceOf(TxConst)
        expect(Array.from(tx2.constValue)).to.deep.equal(['"', '\\', '\\', '.', 'A', '\\', 'n', '"'])
    })
})