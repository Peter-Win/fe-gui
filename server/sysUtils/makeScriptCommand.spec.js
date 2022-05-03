const {expect} = require('chai')
const {makeScriptCommand} = require('./makeScriptCommand')
const {CommonInfo} = require('../CommonInfo')
const {PMgrNpm} = require('../packageManagers/PMgrNpm')
const {PMgrYarn} = require('../packageManagers/PMgrYarn')
const {PMgrPnpm} = require('../packageManagers/PMgrPnpm')

describe('makeScriptCommand', () => {
    let savedPackageManager = null
    beforeEach(() => {
        savedPackageManager = CommonInfo.packageManager
    })
    afterEach(() => {
        CommonInfo.packageManager = savedPackageManager
    })
    it('npm', () => {
        CommonInfo.packageManager = new PMgrNpm()
        expect(makeScriptCommand('start')).to.equal('npm start')
        expect(makeScriptCommand('test')).to.equal('npm test')
        expect(makeScriptCommand('build')).to.equal('npm run build')
    })
    it('yarn', () => {
        CommonInfo.packageManager = new PMgrYarn()
        expect(makeScriptCommand('start')).to.equal('yarn start')
        expect(makeScriptCommand('test')).to.equal('yarn test')
        expect(makeScriptCommand('build')).to.equal('yarn build')
    })
    it('pnpm', () => {
        CommonInfo.packageManager = new PMgrPnpm()
        expect(makeScriptCommand('start')).to.equal('pnpm start')
        expect(makeScriptCommand('test')).to.equal('pnpm test')
        expect(makeScriptCommand('build')).to.equal('pnpm run build')
    })
})