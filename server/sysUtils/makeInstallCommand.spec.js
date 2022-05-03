const {expect} = require('chai')
const {makeInstallCommand} = require('./makeInstallCommand')
const {CommonInfo} = require('../CommonInfo')
const {PMgrPnpm} = require('../packageManagers/PMgrPnpm')
const {PMgrYarn} = require('../packageManagers/PMgrYarn')

describe('makeInstallCommand', () => {
    let savedPackageManager = null
    beforeEach(() => {
        savedPackageManager = CommonInfo.packageManager
    })
    afterEach(() => {
        CommonInfo.packageManager = savedPackageManager
    })

    it('Yarn', () => {
        CommonInfo.packageManager = new PMgrYarn()
        expect(makeInstallCommand('react')).to.equal('yarn add react')
        expect(makeInstallCommand('webpack babel', true)).to.equal('yarn add webpack babel --dev')    
    })

    it('NPM', () => {
        expect(makeInstallCommand('react')).to.equal('npm i react -S')
        expect(makeInstallCommand('webpack babel', true)).to.equal('npm i webpack babel -D')    
    })

    it('pnpm', () => {
        CommonInfo.packageManager = new PMgrPnpm()
        expect(makeInstallCommand('react')).to.equal('pnpm add react -P')
        expect(makeInstallCommand('webpack babel', true)).to.equal('pnpm add webpack babel -D')    
    })
})