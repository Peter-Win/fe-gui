const { expect } = require('chai')
const { updateDeclarationRows, updateDeclarationInTsConfig } = require('./updateDeclaration')

describe('updateDeclarationRows', () => {
    it('empty', () => {
        const rows = []
        const res = updateDeclarationRows(rows, ['module.css', 'module.less'])
        expect(res).to.equal(true)
        expect(rows.join('\n')).to.equal(`declare module "*.module.css";\ndeclare module "*.module.less";`)
    })
    it('partial', () => {
        const rows = [`declare module "*.module.less";`]
        const res = updateDeclarationRows(rows, ['module.css', 'module.less'])
        expect(res).to.equal(true)
        expect(rows.join('\n')).to.equal(`declare module "*.module.less";\ndeclare module "*.module.css";`)
    })
    it('without change', () => {
        const rows = `declare module "*.module.css";\ndeclare module "*.module.less";`.split('\n')
        const res = updateDeclarationRows(rows, ['module.css', 'module.less'])
        expect(res).to.equal(false)
        expect(rows.join('\n')).to.equal(`declare module "*.module.css";\ndeclare module "*.module.less";`)
    })
})

describe('updateDeclarationInTsConfig', () => {
    it('empty config', () => {
        const config = {}
        updateDeclarationInTsConfig(config)
        expect(config).to.deep.equal({ include: ['declaration.d.ts'] })
    })
    it('another includes', () => {
        const config = { include: ['abc'] }
        updateDeclarationInTsConfig(config)
        expect(config).to.deep.equal({ include: ['abc', 'declaration.d.ts'] })
    })
    it('prevent duplication', () => {
        const config = { include: ['declaration.d.ts'] }
        updateDeclarationInTsConfig(config)
        expect(config).to.deep.equal({ include: ['declaration.d.ts'] })
    })
})