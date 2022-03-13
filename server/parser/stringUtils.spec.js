const {expect} = require('chai')
const {fromQuoted} = require('./stringUtils')

describe('fromQuoted', () => {
    expect(fromQuoted('')).to.equal('')
    expect(fromQuoted('""')).to.equal('')
    expect(fromQuoted('A')).to.equal('A')
    expect(fromQuoted('"A"')).to.equal('A')
    expect(fromQuoted("'A'")).to.equal('A')
    expect(fromQuoted('`A`')).to.equal('A')
    expect(fromQuoted('"A\\tB\\tC"')).to.equal('A\tB\tC')
    expect(fromQuoted('"A\r\n"')).to.equal('A\r\n')
})