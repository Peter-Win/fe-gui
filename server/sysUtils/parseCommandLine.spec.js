const { expect } = require('chai')
const { parseCommandLine } = require('./parseCommandLine')

describe('parseCommandLine', () => {
    it('empty', () => {
        expect(parseCommandLine('')).to.eql([])
    })
    it('standard arguments', () => {
        expect(parseCommandLine('node start -port 3000')).to.eql(['node', 'start', '-port', '3000'])
    })
    it('with quoted args', () => {
        expect(parseCommandLine('git commit -m "line 1\\nline \\"2\\""'))
            .to.eql(['git', 'commit', '-m', 'line 1\nline "2"'])
    })
})