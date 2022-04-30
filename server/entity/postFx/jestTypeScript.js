const {updateJestConfig, addPreset} = require('../Jest.utils')
const {wsSendCreateEntity} = require('../../wsSend')
const {installPackage} = require('../../commands/installPackage')

// Jest + TypeScript(transpiler)
module.exports.jestTypeScript = async (name, entities) => {
    await installPackage(name, 'ts-jest @types/jest')

    await updateJestConfig((moduleTaxon, style) => {
        addPreset({moduleTaxon, style, preset: 'ts-jest'})
    }, (msg, t) => wsSendCreateEntity(name, msg, t))
}