const {expect} = require('chai')
const {makeScriptCommand} = require('./makeScriptCommand')
const {CommonInfo} = require('../CommonInfo')

describe('makeScriptCommand', () => {
    it('npm', () => {
        CommonInfo.tech.packageManager = 'NPM'
        expect(CommonInfo.isYarn).to.equal(false)
        expect(makeScriptCommand('start')).to.equal('npm start')
        expect(makeScriptCommand('test')).to.equal('npm test')
        expect(makeScriptCommand('build')).to.equal('npm run build')
    })
    it('yarn', () => {
        CommonInfo.tech.packageManager = 'Yarn'
        expect(CommonInfo.isYarn).to.equal(true)
        expect(makeScriptCommand('start')).to.equal('yarn start')
        expect(makeScriptCommand('test')).to.equal('yarn test')
        expect(makeScriptCommand('build')).to.equal('yarn build')
    })
})