const {expect} = require('chai')
const {isValidName} = require('./isValidName')

describe('isValidName', () => {
    it('good', () => {
        expect(isValidName('a')).to.equal(true)
        expect(isValidName('Z')).to.equal(true)
        expect(isValidName('_')).to.equal(true)
        expect(isValidName('$')).to.equal(true)

        expect(isValidName('CamelCase')).to.equal(true)
        expect(isValidName('lowerCamelCase')).to.equal(true)
        expect(isValidName('_snake_case')).to.equal(true)
        expect(isValidName('$jquery')).to.equal(true)
        expect(isValidName('a21')).to.equal(true)
    })
    it('bad', () => {
        expect(isValidName('1')).to.equal(false)
        expect(isValidName('kebab-case')).to.equal(false)
    })
})