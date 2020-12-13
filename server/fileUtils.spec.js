const path = require('path')
const {expect} = require('chai')
const {isFileExists} = require('./fileUtils')

describe('isFileExists', () => {
    it('main', async () => {
        expect(await isFileExists(__filename)).to.equal(true)
        expect(await isFileExists(__filename + '@')).to.equal(false)
    })
})