const {expect} = require('chai')
const {Style} = require('./Style')

describe('Style', () => {
    it('string', () => {
        const styleSingle = new Style()
        styleSingle.singleQuote = true
        const styleDouble = new Style()
        styleDouble.singleQuote = false

        expect(styleSingle.string('')).to.equal("''")
        expect(styleDouble.string('')).to.equal('""')

        expect(styleSingle.string('Abc')).to.equal("'Abc'")
        expect(styleDouble.string('Abc')).to.equal('"Abc"')

        expect(styleSingle.string("Can't")).to.equal("'Can\\'t'")
        expect(styleDouble.string("Can't")).to.equal('"Can\'t"')

        expect(styleSingle.string('s = "A";')).to.equal("'s = \"A\";'")
        expect(styleDouble.string('s = "A";')).to.equal('"s = \\"A\\";"')

        expect(styleSingle.string('\t\n\r')).to.equal("'\\t\\n\\r'")
        expect(styleDouble.string('\t\n\r')).to.equal('"\\t\\n\\r"')

        expect(styleSingle.string('\\A\\')).to.equal("'\\\\A\\\\'")
        expect(styleDouble.string('\\A\\')).to.equal('"\\\\A\\\\"')
    })
})