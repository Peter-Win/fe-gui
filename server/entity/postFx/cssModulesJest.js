const path = require('path')
const fs = require('fs')
const {CommonInfo} = require('../../CommonInfo')
const {installPackage} = require('../../commands/installPackage')
const {updateJestConfig, setJestTransform} = require('../Jest.utils')
const {wsSendCreateEntity} = require('../../wsSend')
const {isFileExists, makeSrcName} = require('../../fileUtils')
const {createJest} = require('../ReactComponent/createJest')

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
        const createExample = async (compName, testRenderBody) => {
            const pathCompBase = path.join(demoFolder, compName)
            const pathSpec = `${pathCompBase}.spec.${renderExt}`
            const isComp = await isFileExists(`${pathCompBase}.${renderExt}`)
            const isSpec = await isFileExists(pathSpec)
            if (isComp && !isSpec) {
                const { specCode } = createJest({
                    name: compName,
                    isTS: renderExt === 'tsx',
                    className: 'hello',
                    techVer: CommonInfo.techVer,
                    props: [],
                    testRenderBody,
                })
                await fs.promises.writeFile(pathSpec, specCode.join('\n'), {encoding: 'utf8'})
                wsSendCreateEntity(name, `Created new example: ${pathSpec}`)
            }
        }
        await createExample('CssModuleDemo', '<div>CSS Module demo</div>')
        await createExample('LessModuleDemo', '<div>LESS Module demo</div>')
    }
}