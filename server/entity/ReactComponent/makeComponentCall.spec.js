const {expect} = require('chai')
const {makeComponentCall} = require('./makeComponentCall')

describe('makeComponentCall', () => {
    it('without props', () => {
        expect(makeComponentCall({ name: 'HelloWorld', props: []})).to.equal('<HelloWorld />')
    })
    it('required string with test value', () => {
        expect(makeComponentCall({ name: 'First', props: [
            { propName: 'name', isRequired: true, type: 'string', testValue: '"Stranger"' },
        ]})).to.equal('<First name="Stranger" />')    
    })
    it('required string without test value', () => {
        expect(makeComponentCall({ name: 'FirstEmpty', props: [
            { propName: 'name', isRequired: true, type: 'string' },
        ]})).to.equal('<FirstEmpty name="" />')    
    })
    it('non-required string with test value', () => {
        expect(makeComponentCall({ name: 'SmartName', props: [
            { propName: 'name', isRequired: false, type: 'string', testValue: '"None"' },
        ]})).to.equal('<SmartName name="None" />')    
    })
    it('non-required string without test value', () => {
        expect(makeComponentCall({ name: 'OptionalName', props: [
            { propName: 'name', isRequired: false, type: 'string' },
        ]})).to.equal('<OptionalName />')    
    })
    it('boolean cases', () => {
        expect(makeComponentCall({ name: "Bool", props: [
            { propName: 'a', isRequired: true, type: 'boolean', testValue: 'true' },
            { propName: 'b', isRequired: true, type: 'boolean', testValue: 'false' },
            { propName: 'c', isRequired: true, type: 'boolean' },
            { propName: 'd', isRequired: false, type: 'boolean', testValue: 'true' },
            { propName: 'e', isRequired: false, type: 'boolean', testValue: 'false' },
            { propName: 'f', isRequired: false, type: 'boolean' },
        ]})).to.equal('<Bool a b={false} c={false} d e={false} />')
    })
    it('number cases', () => {
        expect(makeComponentCall({ name: "Number", props: [
            { propName: 'a', isRequired: true, type: 'number', testValue: '123.4' },
            { propName: 'b', isRequired: true, type: 'number' },
            { propName: 'c', isRequired: false, type: 'number', testValue: '-1' },
            { propName: 'd', isRequired: false, type: 'number' },
        ]})).to.equal('<Number a={123.4} b={0} c={-1} />')
    })
    it('children', () => {
        expect(makeComponentCall({ name: "Box", props: [
            { propName: 'children', isRequired: false, type: 'React.ReactNode', testValue: '<Inbox />' },
        ]})).to.equal('<Box>\n  <Inbox />\n</Box>')
        expect(makeComponentCall({ name: "Box", props: [
            { propName: 'children', isRequired: false, type: 'React.ReactNode', testValue: '<Inbox />' },
            { propName: 'active', isRequired: false, type: 'boolean', initValue: 'false', testValue: 'true' },
        ]})).to.equal('<Box active>\n  <Inbox />\n</Box>')
    })
})