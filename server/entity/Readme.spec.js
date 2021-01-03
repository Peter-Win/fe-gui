const {expect} = require('chai')
const {Readme} = require('./Readme')

describe('Readme', () => {
    it('addBadge', () => {
        const inst = new Readme()
        const src1 = '# Header\n\nDescription\n\n## Install\n'.split('\n')
        const dst1 = inst.addBadge(src1, '[![npm][npm-image]][npm-url]')
        expect(dst1.join('\n')).to.equal('# Header\n[![npm][npm-image]][npm-url]\n\nDescription\n\n## Install\n')

        const dst2 = inst.addBadge(dst1, '[hello]')
        const exp2 = '# Header\n[![npm][npm-image]][npm-url]\n[hello]\n\nDescription\n\n## Install\n'
        expect(dst2.join('\n')).to.equal(exp2)
    })
})