const {expect} = require('chai')
const {makeInstallCommand} = require('./makeInstallCommand')
const {CommonInfo} = require('../CommonInfo')

it('makeInstallCommand', () => {
    CommonInfo.tech.packageManager = 'Yarn'
    expect(CommonInfo.isYarn).to.equal(true)
    expect(makeInstallCommand('react')).to.equal('yarn add react')
    expect(makeInstallCommand('webpack babel', true)).to.equal('yarn add webpack babel --dev')

    CommonInfo.tech.packageManager = 'NPM'
    expect(CommonInfo.isYarn).to.equal(false)
    expect(makeInstallCommand('react')).to.equal('npm i react -S')
    expect(makeInstallCommand('webpack babel', true)).to.equal('npm i webpack babel -D')
})