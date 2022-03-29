const {expect} = require('chai')
const {makeDefaultValues} = require('./ReactComponent.utils')

describe('makeDefaultValues', () => {
    it('empty', () => {
        expect(makeDefaultValues('HelloWorld', [])).to.deep.equal([])
    })

    it('without default values', () => {
        expect(makeDefaultValues('HelloWorld', [
            {propName: 'name', type: 'string', isRequired: true},
        ])).to.deep.equal([])
    })

    it('mix with and without default values', () => {
        expect(makeDefaultValues('HelloWorld', [
            {propName: 'name', type: 'string', isRequired: true},
            {propName: 'second', type: 'number', isRequired: false, defaultValue: '2'},
        ])).to.deep.equal([
            '',
            'HelloWorld.defaultProps = {',
            '  second: 2,',
            '};'
        ])
    })

    it('different types', () => {
        const res = makeDefaultValues('DifferentTypes', [
            {propName: 'sprop', type: 'string', defaultValue: '"Hello\\tWorld!"'},
            {propName: 'nprop', type: 'number', defaultValue: '123.4'},
            {propName: 'bprop', type: 'boolean', defaultValue: 'true'},
            {propName: 'eprop', type: 'React.Element', defaultValue: '<h1>Hello!</h1>'},
        ])
        expect(res[0]).to.equal('')
        expect(res[1]).to.equal('DifferentTypes.defaultProps = {')
        expect(res[2]).to.equal('  sprop: "Hello\\tWorld!",')
        expect(res[3]).to.equal('  nprop: 123.4,')
        expect(res[4]).to.equal('  bprop: true,')
        expect(res[5]).to.equal('  eprop: <h1>Hello!</h1>,')
        expect(res[6]).to.equal('};')
    })
})