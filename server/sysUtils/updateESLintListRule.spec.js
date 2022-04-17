const {expect} = require('chai')
const {updateESLintListRule, appendOverride} = require('./updateESLintListRule')

const typicalResult = {
    rules: {
        myRule: ["error", {myProp: ["myPropValue"]}],
    },
}

describe('updateESLintListRule', () => {
    it('Empty config', () => {
        const config = {}
        updateESLintListRule(config, 'myRule', 'myProp', 'myPropValue')
        expect(config).to.be.eql(typicalResult)
    })
    it('Create new rule', () => {
        const config = {rules: {}}
        updateESLintListRule(config, 'myRule', 'myProp', 'myPropValue')
        expect(config).to.be.eql(typicalResult)
    })
    it('Incorrect rule type', () => {
        const config = {
            rules: {
                myRule: "off"
            }
        }
        updateESLintListRule(config, 'myRule', 'myProp', 'myPropValue')
        expect(config).to.be.eql(typicalResult)
    })
    it('Short property array', () => {
        const config = {
            rules: {
                myRule: ["error"],
            }
        }
        updateESLintListRule(config, 'myRule', 'myProp', 'myPropValue')
        expect(config).to.be.eql(typicalResult)
    })
    it('Add property', () => {
        const config = {
            rules: {
                myRule: ["error", {myProp: []}]
            }
        }
        updateESLintListRule(config, 'myRule', 'myProp', 'myPropValue')
        expect(config).to.be.eql(typicalResult)
    })
    it('Add property 2', () => {
        const config = {
            rules: {
                myRule: ["error", {myProp: ["first"]}]
            }
        }
        updateESLintListRule(config, 'myRule', 'myProp', 'myPropValue')
        expect(config).to.be.eql({
            rules: {
                myRule: ["error", {myProp: ["first", "myPropValue"]}]
            }
        })
    })
    it('Prevent to add existing property', () => {
        const config = {
            rules: {
                myRule: ["error", {myProp: ['myPropValue']}]
            }
        }
        updateESLintListRule(config, 'myRule', 'myProp', 'myPropValue')
        expect(config).to.be.eql(typicalResult)
    })
    it('Dont change another properties', () => {
        const config = {
            rules: {
                myRule: ["error", { test: "ABC" }],
                rule2: 2,
            }
        }
        updateESLintListRule(config, 'myRule', 'myProp', 'myPropValue')
        expect(config).to.be.eql({
            rules: {
                myRule: ["error", { test: "ABC", myProp: ['myPropValue']}],
                rule2: 2,
            }
        })
    })
})

describe('appendOverride', () => {
    it('config without overrides', () => {
        const src = {}
        const item = { files: ['*.stories.jsx'], rules: {abc: 'hello'} }
        appendOverride(src, item)
        expect(src).to.deep.equal({
            overrides: [
                {
                    files: ['*.stories.jsx'],
                    rules: { abc: 'hello' },
                }
            ]
        })
    })
    it('config with overrides', () => {
        const src = {
            overrides: [
                { files: ['*.js'], rules: { first: 'First' } },
            ]
        }
        const item = { files: ['*.stories.jsx'], rules: {second: 'Second'} }
        appendOverride(src, item)
        expect(src).to.deep.equal({
            overrides: [
                {
                    files: ['*.js'],
                    rules: { first: 'First' },
                },
                {
                    files: ['*.stories.jsx'],
                    rules: { second: 'Second' },
                },
            ]
        })
    })
})