const path = require('path')
const fs = require('fs')
const { getAvailableExtensions, installStyleModules, updateDeclaration } = require('./CssModules.utils')
const { CommonInfo } = require('../../CommonInfo')
const { wsSendCreateEntity } = require('../../wsSend')
const { installPackage } = require('../../commands/installPackage')
const { isFileExists, makeSrcName } = require('../../fileUtils')
const { injectDemoCode } = require('../../sysUtils/injectDemoCode')

const styleDef = [
    {
        ext: 'css',
        agent: 'CSS',
        avail: true,
        loaders: [],
    },
    {
        ext: 'less',
        agent: 'LESS',
        avail: true,
        loaders: ['less-loader'],
        devDeps: 'less',
    },
]

class CssModules {
    name = 'CssModules'
    depends = ['WebPack', ...styleDef.map(({agent}) => agent)]
    isInit = false
    isReady = false

    async init() {
        const {entities} = require('../all')
        const {WebPack} = entities
        this.isInit = WebPack.isInit
        const wpOk = await isFileExists(WebPack.getConfigName())
        if (!wpOk) return
        const availExts = await getAvailableExtensions(WebPack, styleDef.map(({ext}) => ext))
        this.isReady = availExts.size > 0
        styleDef.forEach(item => {
            item.avail = availExts.has(item.ext)
        })
        this.defaultParams = {
            ...styleDef.reduce((acc, {ext}) => ({
                ...acc,
                [`${ext}LocalName`]: '[path][name]__[local]--[hash:base64:5]',
            }), {})
        }
    }

    defaultParams = {}

    async create(params) {
        const {entities} = require('../all')
        const {WebPack, TypeScript, PackageJson} = entities;
        const {language, transpiler, framework} = CommonInfo.tech
        const exampleFolder = 'cssModulesDemo'
        const log = (msg, type) => wsSendCreateEntity(this.name, msg, type)
        const addDependency = async (packageName, isDev=true) => {
            await PackageJson.load()
            if (isDev) {
                if (PackageJson.isDevDependency(packageName)) return
            } else {
                if (PackageJson.isDependency(packageName)) return
            }
            await installPackage(this.name, packageName, isDev)
        }
        const {files, imports} = await installStyleModules({
            log,
            addDependency,
            styleDef,
            params,
            WebPack,
            TypeScript,
            language,
            transpiler,
            framework,
            exampleFolder,
        })
        if (files.length > 0) {
            const dirName = makeSrcName(exampleFolder)
            const isDirExists = await isFileExists(dirName)
            if (!isDirExists) {
                await fs.promises.mkdir(dirName)
                wsSendCreateEntity(this.name, `Created folder for examples: ${dirName}`)
            }
            for (const {name, data} of files) {
                const fullName = path.join(dirName, name)
                await fs.promises.writeFile(fullName, data, {encoding: 'utf8'})
                wsSendCreateEntity(this.name, `- Created example: ${fullName}`)
            }
        }
        for (const {hdr, code} of imports) {
            await injectDemoCode(`MainFrame.${CommonInfo.getExtension('render')}`, hdr, code)
        }
        if (transpiler === 'TypeScript') {
            await updateDeclaration(styleDef.map(({ext}) => ext), log)
        }
    }

    description = `
<p>
CSS modules let you import your .css file into a JavaScript Object with the CSS definitions as properties. 
It also lets you use the compose property to extend and modularize style definitions.
</p>
<p>
CSS modules do not have an official specification nor are they a browser feature. 
They are part of a compilation process that executes against your project to convert scoped classes and selectors into CSS files that the browser can parse and understand.
</p>
<p><a href="https://github.com/css-modules/css-modules" target="_blank">Documentation</a></p>
<style>
.css-module-item { margin: .5em 0; padding: .4em .6em; border: thin solid silver; border-radius: .6em; }
.css-module-header { font-size: 110%; font-weight: bold; color: #555; }
.css-module-inbox { margin-left: 1em; }
.css-module-item .local-name input {width:30em;}
</style>
<script>
  var styleExtList = ${JSON.stringify(styleDef.map(({ext}) => ext))};
</script>
${CommonInfo.tech.transpiler === 'TypeScript' ? `
<p>For the current configuration, the plugin 
  <a href="https://www.npmjs.com/package/typescript-plugin-css-modules" target="_blank">typescript-plugin-css-modules</a> 
  is used.
</p>
`: ''}
`
    get controls() {
        return styleDef.map(item => this.drawStyleItem(item)).join('')
    }
    drawStyleItem({ext, avail}) {
        return `
<div class="css-module-item">
  <div class="css-module-header">
  ${ext.toUpperCase()} Modules ${avail ? ' ready to install' : ' already installed'}
  </div>
  ${(avail || '') && `  <div>
    <div class="rn-ctrl" data-type="Checkbox" data-name="${ext}" data-title="Install"></div>
    <div class="css-module-inbox">
      <div class="rn-ctrl" data-type="Checkbox" data-name="${ext}Example" data-title="Create an example"></div>
      <div class="rn-ctrl local-name" data-type="String" data-name="${ext}LocalName" data-title="Local Ident Name"></div>
      <div><a href="https://webpack.js.org/loaders/css-loader/#localidentname" target="_blank">More about parameter <code>localIdentName</code></a></div>
    </div>
  </div>`}
</div>
`
    }
}

module.exports = {CssModules}