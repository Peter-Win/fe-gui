const {updateJestConfig, addPreset} = require('../Jest.utils')
const {wsSendCreateEntity} = require('../../wsSend')
const {installPackage} = require('../../commands/installPackage')
const {addType} = require('../../sysUtils/tsConfig')

// Jest + TypeScript(transpiler)
module.exports.jestTypeScript = async (name, entities) => {
    const log = (msg, t) => wsSendCreateEntity(name, msg, t)
    await installPackage(name, 'ts-jest @types/jest')

    await updateJestConfig((moduleTaxon, style) => {
        addPreset({moduleTaxon, style, preset: 'ts-jest'})
    }, log)

    await entities.TypeScript.updateConfig((config) => {
        addType(config, 'jest')
    }, log)
}