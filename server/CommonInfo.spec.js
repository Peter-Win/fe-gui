const {expect} = require('chai')
const {CommonInfo} = require('./CommonInfo')

describe('CommonInfo', () => {
    it('getExtension', () => {
        CommonInfo.tech.language = 'JavaScript'
        CommonInfo.tech.framework = ''
        CommonInfo.tech.styleLess = false
        expect(CommonInfo.getExtension('render')).to.equal('js')
        expect(CommonInfo.getExtension('logic')).to.equal('js')
        expect(CommonInfo.getExtension('style')).to.equal('css')
        CommonInfo.tech.preferStyle = 'less'
        expect(CommonInfo.getExtension('style')).to.equal('less')
        CommonInfo.tech.language = 'TypeScript'
        expect(CommonInfo.getExtension('render')).to.equal('ts')
        expect(CommonInfo.getExtension('logic')).to.equal('ts')
        CommonInfo.tech.framework = 'React'
        expect(CommonInfo.getExtension('render')).to.equal('tsx')
        expect(CommonInfo.getExtension('logic')).to.equal('ts')
        CommonInfo.tech.language = 'JavaScript'
        expect(CommonInfo.getExtension('render')).to.equal('jsx')
        expect(CommonInfo.getExtension('logic')).to.equal('js')
    })
    it('getExtsList', () => {
        CommonInfo.tech.language = 'JavaScript'
        CommonInfo.tech.framework = ''
        expect(CommonInfo.getExtsList()).to.have.members(['js'])
        CommonInfo.tech.framework = 'React'
        expect(CommonInfo.getExtsList()).to.have.members(['js','jsx'])
        CommonInfo.tech.language = 'TypeScript'
        CommonInfo.tech.framework = ''
        expect(CommonInfo.getExtsList()).to.have.members(['js','ts'])
        CommonInfo.tech.framework = 'React'
        expect(CommonInfo.getExtsList()).to.have.members(['js','ts','tsx'])
    })
    it('getPreferStyler', () => {
        CommonInfo.tech.styleCss = false
        CommonInfo.tech.styleLess = false
        expect(CommonInfo.getPreferStyler()).to.equal('')
        CommonInfo.tech.styleCss = true
        expect(CommonInfo.getPreferStyler()).to.equal('CSS')
        CommonInfo.tech.styleLess = true
        expect(CommonInfo.getPreferStyler()).to.equal('LESS')
    })
})

describe('makeCodeExts', () => {
    let oldTech
    beforeEach(() => {
        oldTech = JSON.stringify(CommonInfo.tech)
    })
    afterEach(() => {
        CommonInfo.tech = JSON.parse(oldTech)
    })
    it('JavaScript', () => {
        CommonInfo.tech = { language: 'JavaScript' }
        expect(CommonInfo.makeCodeExts()).to.eql(new Set(['js']))
    })
    it('React+JS', () => {
        CommonInfo.tech = { language: 'JavaScript', framework: 'React' }
        expect(CommonInfo.makeCodeExts()).to.eql(new Set(['js', 'jsx']))
    })
    it('React+TS', () => {
        CommonInfo.tech = { language: 'TypeScript', framework: 'React' }
        expect(CommonInfo.makeCodeExts()).to.eql(new Set(['ts', 'tsx']))
    })
    it('Vue+JS', () => {
        CommonInfo.tech = { language: 'JavaScript', framework: 'Vue' }
        expect(CommonInfo.makeCodeExts()).to.eql(new Set(['js', 'jsx', 'vue']))
    })
    it('Vue+TS', () => {
        CommonInfo.tech = { language: 'TypeScript', framework: 'Vue' }
        expect(CommonInfo.makeCodeExts()).to.eql(new Set(['ts', 'tsx', 'vue']))
    })
})