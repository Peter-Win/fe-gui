const path = require('path')
const {CommonInfo} = require('../../CommonInfo')
const {installPackage} = require('../../commands/installPackage')
const {updateJestConfig, setJestTransform} = require('../Jest.utils')
const {wsSendCreateEntity} = require('../../wsSend')
const {isFileExists, makeSrcName} = require('../../fileUtils')
const {buildTemplate} = require('../../sysUtils/loadTemplate')

module.exports.cssModulesJest = async (name, entities) => {
    const { PackageJson } = entities
    if (!PackageJson.isDevDependency('jest-css-modules-transform')) {
        await installPackage(name, 'jest-css-modules-transform', true)
        await updateJestConfig((moduleTaxon, style) => {
            setJestTransform({
                moduleTaxon,
                transpiler: CommonInfo.tech.transpiler,
                key: ".+\\.(css|styl|less|sass|scss)$", 
                value: "jest-css-modules-transform",
                style
            })
        }, (msg, t) => wsSendCreateEntity(name, msg, t))
    }

    // Add example for CSS Module Demo component
    const demoFolder = makeSrcName('cssModulesDemo')
    if (await isFileExists(demoFolder)) {
        const renderExt = CommonInfo.getExtension('render')
        const createExample = async (compName) => {
            const pathCompBase = path.join(demoFolder, compName)
            const pathSpec = `${pathCompBase}.spec.${renderExt}`
            const isComp = await isFileExists(`${pathCompBase}.${renderExt}`)
            const isSpec = await isFileExists(pathSpec)
            if (isComp && !isSpec) {
                const params = renderExt === 'tsx' ? {
                    containerType: ': HTMLDivElement | null', // let container<%= containerType %> = null;
                    safe: '?',
                } : { containerType: '', safe: ''}
                await buildTemplate(`${compName}.spec.jsx`, pathSpec, params)
                wsSendCreateEntity(name, `Created new example: ${pathSpec}`)
            }
        }
        await createExample('CssModuleDemo')
        await createExample('LessModuleDemo')
    }
}