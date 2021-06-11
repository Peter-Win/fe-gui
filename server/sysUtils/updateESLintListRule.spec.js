const {expect} = require('chai')
const {updateESLintListRule} = require('./updateESLintListRule')

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