const {expect} = require('chai')
const {extendRule} = require('./esLintUtils')

describe('extendRule', () => {
    it('create new rule', () => {
        const config = {}
        extendRule(config, 'my-rule', ['error', { option: ['A', 'B', 'C'] }])
        expect(config).to.deep.equal({
            rules: {
                'my-rule': ['error', { option: ['A', 'B', 'C'] }],
            }
        })
    })
})