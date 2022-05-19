const fs = require('fs')
const path = require('path')
const {installPackage, installPackageSmart} = require('../commands/installPackage')
const {wsSend} = require('../wsServer')
const {wsSendCreateEntity} = require('../wsSend')
const {CommonInfo} = require('../CommonInfo')
const {buildTemplate, loadTemplate} = require('../sysUtils/loadTemplate')
const {makeSrcName, makeFullName} = require('../fileUtils')
const {splitRows, writeRows} = require('../sysUtils/textFile')
const {getHiVersion} = require('../sysUtils/versions')
const { SWC } = require('./SWC')

class Jest {
    name = 'Jest'
    depends = ['Babel', 'TypeScript', 'SWC']
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
    get controls() {
        return `
<div class="rn-ctrl" data-name="example" data-type="Checkbox" data-title="Generate example test"></div>
${this.availInlineSnapshots() ? `
<div class="rn-ctrl" data-name="useSnapshots" data-type="Checkbox" data-title="Use snapshots"></div>
<div style="padding-left:2em;">
  <div class="rn-ctrl" data-name="usePretty" data-type="Checkbox" data-title="Use Pretty library for snapshots"></div>
  <a href="https://www.npmjs.com/package/pretty" target="_blank">Pretty</a> - Some tweaks for beautifying HTML with js-beautify according to my preferences.
</div>` : ''}
<div class="rn-ctrl" data-name="coverage" data-type="Checkbox" data-title="Coverage script"></div>
<div class="rn-ctrl" data-name="watch" data-type="Checkbox" data-title="Watch script"></div>
<hr/>
<p>
<b>Note:</b> If you use VSCode for development, we recommend installing a special plugin 
<a href="https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest" target="_blank">Jest</a>.
</p>
`}
    defaultParams = {
        example: true,
        coverage: true,
        watch: false,
        useSnapshots: true,
        usePretty: true,
    }

    async init() {
        const {entities: {PackageJson, Babel, TypeScript, SWC}} = require('./all')
        this.isInit = PackageJson.isDevDependency('jest')
        this.isReady = false
        if (this.isInit) {
            CommonInfo.tech.unitTesting = this.name
            CommonInfo.findPackageVersion('jest').then(ver => {
                CommonInfo.techVer.unitTesting = ver
            })
        } else {
            this.isReady = Babel.isInit || TypeScript.isInit || SWC.isInit
        }
    }

    /**
     * @param {Object} params
     * @param {boolean} params.example  Generate example files with test demo.
     * @param {boolean} params.coverage Create special command for test coverage in package.json
     * @param {boolean} params.watch Create special command for tests watch in package.json
     * @param {boolean} params.useSnapshots Create command for update snapshots in package.json
     * @param {boolean} params.usePretty Add pretty to dependendies
     * @return {Promise<void>}
     */
    async create(params) {
        const {entities: {PackageJson, Babel, TypeScript}} = require('./all')
        const {tech} = CommonInfo
        const originalTypeScript = TypeScript.isInit
        if (!this.availInlineSnapshots()) {
            params.useSnapshots = false
        }
        if (!params.useSnapshots) {
            params.usePretty = false
        }

        // Config
        const configParams = {
            roots: ["<rootDir>/src"],
            testEnvironment: 'jsdom',
        }
        const configName = makeFullName('jest.config.js')
        const configText = `module.exports = {\n${
            Object.entries(configParams)
                .map(([key, value]) => `  ${key}: ${JSON.stringify(value)},\n`)
                .join('')
        }}`
        await fs.promises.writeFile(configName, configText)

        await installPackageSmart(this.name, ['jest', 'jest-environment-jsdom'])
        if (tech.transpiler === 'Babel') {
            await installPackage(this.name, 'babel-jest @babel/preset-env')
            await Babel.updatePreset(['@babel/preset-env', {targets: {node: 'current'}}])
        }

        if (params.usePretty) {
            await installPackage(this.name, 'pretty', false)
            if (CommonInfo.tech.language === 'TypeScript') {
                await installPackage(this.name, '@types/pretty', true)
            }
        }

        PackageJson.update(pjEntity => {
            const {packageManager, tech} = CommonInfo;
            [
                {
                    key: 'test',
                    cond: true,
                    cmd: 'jest',
                    label: 'Test command',
                    cli: tech.packageManager === 'Yarn' ? 'yarn test OR yarn jest' : '',
                },
                {
                    key: 'test:coverage',
                    cond: params.coverage,
                    cmd: 'jest --coverage',
                    label: 'Test with coverage',
                },
                {
                    key: 'test:watch',
                    cond: params.watch,
                    cmd: 'jest --watch',
                    label: 'Test with watch',
                },
                {
                    key: 'test:update',
                    cond: params.useSnapshots,
                    cmd: 'jest --updateSnapshot',
                    label: 'Snapshots update',
                },
            ].filter(({cond}) => cond).forEach(({key, cmd, label, cli}) => { 
                pjEntity.addScript(key, cmd)
                const xcmd = cli || packageManager.makeRun(key)
                wsSendCreateEntity('Jest', `${label}: ${xcmd}`)
            })
        })

        if (params.example) {
            const ext = CommonInfo.getExtension('logic')
            const t = (value) => CommonInfo.tech.language === 'TypeScript' ? value : ''
            const fnParams = {
                typeDecl1: t(': number'),
                type2: t('<T>'),
                typeDecl2: t(': T[]'),
            }
            const exampleFn = makeSrcName('jestExample.' + ext)
            const exampleTest = makeSrcName('jestExample.test.' + ext)
            await buildTemplate(`jestExample.js`, exampleFn, fnParams)
            await buildTemplate(`jestExample.test.js`, exampleTest)
            wsSend('createEntityMsg', {name: this.name, message: `Example code: ${exampleTest}`})
            if (CommonInfo.tech.framework === 'React') {
                await this.createReactExample(params)
            } 
        }

    }

    async createReactExample(params) {
        const ts = CommonInfo.tech.language === 'TypeScript'
        const reactVer = getHiVersion(CommonInfo.techVer.framework, 18)
        const suffix = reactVer <= 17 ? 17 : 18
        const extX = CommonInfo.getExtension('render')
        const folderName = makeSrcName('FormDemo')
        await fs.promises.mkdir(folderName)
        wsSendCreateEntity(this.name, `An example of testing a react component is in the folder ${folderName}.`)

        // index
        const indexName = path.join(folderName, `index.${CommonInfo.getExtension('logic')}`)
        await fs.promises.writeFile(indexName, `export * from "./FormDemo";\n`)

        // component
        const shortName = `FormDemo.${extX}`
        const dstName = path.join(folderName, shortName)
        await buildTemplate(shortName, dstName)

        // test
        let rows = []
        const content = await loadTemplate(`FormDemoSpec-${suffix}.${extX}`)
        rows = splitRows(content)
        if (!params.usePretty) {
            // вырезать использование pretty
            rows = rows.filter(row => !row.startsWith('import pretty'))
            rows = rows.map(row => {
                const pos = row.indexOf('expect(pretty(')
                if (pos < 0) return row
                return row.replace('expect(pretty(', 'expect((')
            })
        }
        if (!params.useSnapshots) {
            // Вырезать использование снапшота
            let valid = true
            rows = rows.filter(row => {
                let ok = false
                if (valid) {
                    if (row.indexOf(`it("Inline snapshot"`) >= 0) {
                        valid = false
                    } else {
                        ok = true
                    }
                } else {
                    if (row === '  });') valid = true
                }
                return ok
            })
        }
        const dstTestName = path.join(folderName, `FormDemo.spec.${extX}`)
        await writeRows(dstTestName, rows)
    }

    /**
     * @param {Set<string>} ignores
     */
    vcsIgnore(ignores) {
        ignores.add('/coverage')
    }

    /**
     * Jest have a bug: Inline snapshots are not written to js files containing JSX syntax 
     * https://github.com/facebook/jest/issues/11741
     * So we disable inline snapshots for JSX
     * @returns {boolean} true, if inline stapshots are available
     */
    availInlineSnapshots() {
        return CommonInfo.tech.language !== 'JavaScript'
    }
}

module.exports = {Jest}