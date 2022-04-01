const {expect} = require('chai')
const {getHiVersion} = require('./versions')

describe('getHiVersion', () => {
    expect(getHiVersion(null, 18)).to.equal(18)
    expect(getHiVersion('17', 18)).to.equal(17)
    expect(getHiVersion('17.0.2')).to.equal(17)
})