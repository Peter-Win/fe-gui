const {expect} = require('chai')
const {makeCmdLineParam} = require('./makeCmdLineParam')

describe('makeCmdLineParam', () => {
    expect(makeCmdLineParam('hello', true)).to.equal('"hello"')
    expect(makeCmdLineParam('hello', false)).to.equal('hello')
    expect(makeCmdLineParam('hello world', true)).to.equal('"hello world"')
    expect(makeCmdLineParam('hello world', false)).to.equal('"hello world"')
    expect(makeCmdLineParam('" a\tb"\n\r')).to.equal('"\\\" a\\tb\\\"\\n\\r"');
})