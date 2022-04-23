const {expect} = require('chai')
const {camelToKebab, camelToLower } = require('./nameConversion')

it('camelToKebab', () => {
    expect(camelToKebab('')).to.equal('')
    expect(camelToKebab('hello')).to.equal('hello')
    expect(camelToKebab('Hello')).to.equal('hello')
    expect(camelToKebab('myCamelCase')).to.equal('my-camel-case')
    expect(camelToKebab('CSSModule')).to.equal('css-module')
    expect(camelToKebab('CssModule')).to.equal('css-module')
    expect(camelToKebab('HTML2Handler')).to.equal('html2-handler')
})

it('camelToLower', () => {
    expect(camelToLower('')).to.equal('')
    expect(camelToLower('HelloWorld')).to.equal('helloWorld')
    expect(camelToLower('helloWorld')).to.equal('helloWorld')
})