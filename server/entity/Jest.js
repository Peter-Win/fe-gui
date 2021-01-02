const fs = require('fs')
const {installPackage} = require('../commands/installPackage')
const {wsSend} = require('../wsServer')
const {CommonInfo} = require('../CommonInfo')
const {buildTemplate} = require('../sysUtils/loadTemplate')
const {makeSrcName, makeFullName} = require('../fileUtils')

class Jest {
    name = 'Jest'
    depends = ['Babel', 'TypeScript']
    isInit = false
    isReady = false
    description = `
<div style="display: flex; align-content: center;">
  <img src="https://jestjs.io/img/jest.svg" width="64px" height="48px" />
  <span style="font-size: 36px; margin-left: -20px; margin-top: 4px;">JEST</span>
</div>
<div>Jest is a delightful JavaScript Testing Framework with a focus on simplicity.</div>
<div><a href="https://jestjs.io/" target="_blank">Official site</a></div>
`
    controls = `
<div class="rn-ctrl" data-name="example" data-type="Checkbox" data-title="Generate example test"></div>
<div class="rn-ctrl" data-name="coverage" data-type="Checkbox" data-title="Coverage script"></div>
<div class="rn-ctrl" data-name="watch" data-type="Checkbox" data-title="Watch script"></div>
`
    defaultParams = {
        example: true,
        coverage: true,
        watch: false,
    }

    async init() {
        const {entities: {PackageJson, Babel, TypeScript}} = require('./all')
        this.isInit = PackageJson.isDevDependency('jest')
        if (this.isInit) {

        } else {
            this.isReady = Babel.isInit || TypeScript.isInit
        }
    }

    /**
     * @param {Object} params
     * @param {boolean} params.example  Generate example files with test demo.
     * @return {Promise<void>}
     */
    async create(params) {
        const {entities: {PackageJson, Babel, TypeScript}} = require('./all')
        const {tech} = CommonInfo
        const useTypeScript = TypeScript.isInit

        if (params.example) {
            const ext = CommonInfo.getExtension('logic')
            const exampleFn = makeSrcName('jestExample.' + ext)
            const exampleTest = makeSrcName('jestExample.test.' + ext)
            await buildTemplate(`jestExample.${ext}`, exampleFn)
            await buildTemplate(`jestExample.test.js`, exampleTest)
            wsSend('createEntityMsg', {name: this.name, message: `Example code: ${exampleTest}`})
        }

        // Config
        const configParams = {
            roots: ["<rootDir>/src"],
        }
        if (useTypeScript) {
            configParams.preset = 'ts-jest'
            configParams.testEnvironment = 'node'
        }
        const configName = makeFullName('jest.config.js')
        const configText = `module.exports = {\n${
            Object.entries(configParams)
                .map(([key, value]) => `  ${key}: ${JSON.stringify(value)},\n`)
                .join('')
        }}`
        await fs.promises.writeFile(configName, configText)

        await installPackage(this.name, 'jest')
        if (useTypeScript) {
            await installPackage(this.name, 'ts-jest @types/jest')
        } else if (tech.transpiler === 'Babel' && tech.language === 'TypeScript') {
            await installPackage(this.name, 'babel-jest @babel/preset-env')
            await Babel.updatePreset(['@babel/preset-env', {targets: {node: 'current'}}])
        }

        PackageJson.update(pjEntity => {
            pjEntity.data.scripts.test = 'jest'
            const testCmd = CommonInfo.isYarn ? 'yarn test OR yarn jest' : 'npm t'
            wsSend('createEntityMsg', {name: 'Jest', message: 'Test command: ' + testCmd})
            if (params.coverage) {
                const key = 'test:coverage'
                const coverageCmd = (CommonInfo.isYarn ? 'yarn' : 'npm run') + ' ' + key
                pjEntity.data.scripts[key] = 'jest --coverage'
                wsSend('createEntityMsg', {name: 'Jest', message: 'Test with coverage: ' + coverageCmd})
            }
            if (params.watch) {
                const key = 'test:watch'
                const watchCmd = (CommonInfo.isYarn ? 'yarn' : 'npm run') + ' ' + key
                pjEntity.data.scripts[key] = 'jest --watch'
                wsSend('createEntityMsg', {name: 'Jest', message: 'Test with watch: ' + watchCmd})
            }
        })
    }
}

module.exports = {Jest}