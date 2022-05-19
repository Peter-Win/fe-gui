const { expect } = require('chai')
const { addType } = require('./tsConfig')

describe('addType', () => {
    it('to empty tsconfig', () => {
        const config = {}
        addType(config, 'jest')
        expect(config).to.be.deep.equal({ compilerOptions: {
            types: ['jest'],
        }})
    })
    it('to existing list', () => {
        const config = { compilerOptions: { types: ['jest'] } }
        addType(config, 'node')
        expect(config).to.be.deep.equal({ compilerOptions: { types: ['jest', 'node'] }})
    })
    it('with prevent duplicate', () => {
        const config = { compilerOptions: { types: ['jest'] } }
        addType(config, 'jest')
        expect(config).to.be.deep.equal({ compilerOptions: { types: ['jest'] }})
    })
})