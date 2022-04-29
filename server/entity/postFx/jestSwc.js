const {wsSendCreateEntity} = require('../../wsSend')
const {updateJestConfig, setJestTransform} = require('../Jest.utils')
const {installPackage} = require('../../commands/installPackage')

/**
 * Using SWC for Jest tests run 
 * see https://swc.rs/docs/usage/jest
 */
module.exports.jestSwc = async (name, entities) => {
    await installPackage(name, '@swc/jest')

    await updateJestConfig((moduleTaxon, style) => {
        setJestTransform({
            moduleTaxon,
            transpiler: 'SWC',
            key: "^.+\\.(t|j)sx?$",
            value: '@swc/jest',
            style,
        })
    }, (msg, t) => wsSendCreateEntity(name, msg, t))
}