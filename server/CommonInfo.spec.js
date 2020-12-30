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
        CommonInfo.tech.styleLess = true
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