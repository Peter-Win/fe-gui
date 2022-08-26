const fs = require('fs')
const {wsSend} = require('../wsServer')
const {makeFullName, makeSrcName, isFileExists} = require('../fileUtils')
const {buildTemplate} = require('../sysUtils/loadTemplate')
const {CommonInfo} = require('../CommonInfo')
const {merge} = require('./WebPack.utils')
const {installPackage} = require('../commands/installPackage')
const {parseModule, parseExpression} = require('../parser/parseExpression')
const {ReaderCtx} = require('../parser/ReaderCtx')
const {Style} = require('../parser/Style')
const {formatChunks} = require('../parser/WriterCtx')

class WebPack {
    name = 'WebPack'
    depends = ['PackageJson']
    isInit = false
    canCreateNewProject = true

    loadConfig(configName) {
        try {
            // Считать содержимое файла конфигурации вебпака.
            // Пока нет смысла его парсить. Проще выполнить и получить готовую структуру
            const config = require(configName)
            console.log('webpack config:', config)
            const props = {
            }
            const {devServer = {}} = config
            const {port} = devServer
            if (port) {
                props.localAddress = `http://localhost:${port}`
                props.port = port
            }
            CommonInfo.props.WebPack = props

            const {plugins = []} = config
            plugins.forEach((item) => {
                const options = item.options || item.userOptions || {}
                if (options.template && options.title) {
                    const {title} = options
                    CommonInfo.extParams.title = String(title).trim()
                    console.log('Detected application title: ', title)
                }
            })
            return null
        } catch (e) {
            return e
        }
    }

    async init() {
        this.isInit = false
        this.canCreateNewProject = false
        // Теоретически конфиг вебпака может лежать в любой папке под любым именем и их даже может быть несколько.
        // Но пока считаем, что конфиг один со стандартным именем.
        const configName = makeFullName('webpack.config.js')
        if (await isFileExists(configName)) {
            const err = this.loadConfig(configName)
            if (!err) {
                this.isInit = true
                CommonInfo.tech.bundler = this.name
                CommonInfo.techVer.bundler = await CommonInfo.findPackageVersion('webpack')
            } else {
                wsSend('statusMessage', {text: err.message, type: 'err'})
            }
            return
        } else {
            console.log(configName, 'not found')
            wsSend('statusMessage', {text: `${configName} not found`, type: 'err'})
        }
        // Тут надо понять, установлен ли вебпак.
        const {entities} = require('./all')
        // Если сюда дошли, значит PackageJson успешно загружен
        if (entities.PackageJson.isDevDependency('webpack')) {
            // Установлен. Значит имеем дело с готовым проектом со слишком сложной конфигурацией.
            wsSend('statusMessage', {text: 'A project with an overly complex configuration was found.', type: 'err'})
        } else {
            // Если нет, значит можно создавать новый проект
            wsSend('statusMessage', {text: 'Creation of a new project is required.', type: 'success'})
            this.canCreateNewProject = true
        }
    }

    async create() {
        const {PackageJson} = require('../entity/all').entities
        try {
            await installPackage(this.name, 'webpack webpack-cli')
            await installPackage(this.name, 'html-webpack-plugin clean-webpack-plugin')
            // TODO: 2021-03-09. Detected problem "Cannot find module 'loader-utils'" in this.loadConfig
            await installPackage(this.name, 'loader-utils')
            await installPackage(this.name, 'webpack-dev-server')

            // html template
            const htmlName = makeSrcName('template.html')
            wsSend('createEntityMsg', {name: this.name, type: 'info',
                message: `html template: ${htmlName}`})
            await buildTemplate('basicIndex.html', htmlName)

            // index TODO: для отладки
            if (CommonInfo.tech.language === 'JavaScript' && CommonInfo.tech.transpiler.toLowerCase() === 'none') {
                const params = {
                    titleStr: CommonInfo.getTitleStr(),
                }
                await buildTemplate('basicIndex.js', makeSrcName('index.js'), params)
            }

            // webpack.config.js
            const cfgName = makeFullName('webpack.config.js')
            wsSend('createEntityMsg', {name: this.name, type: 'info',
                message: `webpack config: ${cfgName}`})
            await buildTemplate('basicWebPack.config.js', cfgName, {
                entryExt: CommonInfo.getExtension('render'),
                title: CommonInfo.extParams.title.trim(),
                port: CommonInfo.extParams.port,
            })

            // modify package.json
            await PackageJson.update(async (ctrl) => {
                ctrl.addScript('build', 'webpack --mode=production')
                // TODO: devServer
                ctrl.addScript('start', 'webpack serve --mode=development')
            })

            const err = this.loadConfig(cfgName)
            if (err) throw err

            this.canCreateNewProject = false
        } catch (e) {
            throw e
        }
    }

    /**
     * Full config name with a full path
     * @return {string}
     */
    getConfigName() {
        return makeFullName('webpack.config.js')
    }

    /**
     * Добавить раздел в файл конфигурации
     * Происходит умное смерживание
     * @param {string} part
     */
    async setPart(part, log) {
        const configName = this.getConfigName()
        const configSource = await fs.promises.readFile(configName)
        const result = merge(configSource, part)
        await fs.promises.writeFile(configName, result)
        if (log) log(`Updated ${configName}`)
    }

    async loadConfigTaxon() {
        const configSource = await fs.promises.readFile(this.getConfigName())
        const sourceNode = parseModule(ReaderCtx.fromText(configSource))
        return sourceNode.createTaxon()
    }
    async saveConfigTaxon(taxon) {
        const style = this.getStyle()
        const chunks = []
        taxon.exportChunks(chunks, style)
        const text = formatChunks(chunks, style)
        await fs.promises.writeFile(this.getConfigName(), text)
    }
    getStyle() {
        return new Style()
    }
}
module.exports = {WebPack}