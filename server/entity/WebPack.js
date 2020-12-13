const fs = require('fs')
const {makeInstallCommand} = require('../sysUtils/makeInstallCommand')
const {asyncExec} = require('../sysUtils/asyncExec')
const {wsSend} = require('../wsServer')
const {makeFullName, makeSrcName, isFileExists} = require('../fileUtils')
const {CommonInfo} = require('../CommonInfo')

const cfgTemplate = ({entryExt, title, port}) => `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.${entryExt}',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: '${title}',
      template: path.resolve(__dirname, './src/template.html'),
      filename: 'index.html',
      }),
  ],
  // TODO: devServer
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: ${port},
  },
};
`.trim();

const htmlTemplate = () => `
<!doctype html>
<html>
  <head>
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>

  <body>
    <div id="root"></div>
  </body>
</html>
`.trim()

const indexTemplate = () => `
window.addEventListener('load', function(){
  var heading = document.createElement('h1');
  heading.innerHTML = 'Hello, world!'
  document.querySelector('#root').append(heading)  
});
`.trim()

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
                wsSend('statusMessage', {text: 'Webpack detected'})
            } else {
                wsSend('statusMessage', {text: err.message, type: 'err'})
            }
            return
        } else {
            console.log(configName, 'not found')
            wsSend('statusMessage', {text: `${configName} not found`, type: 'err'})
        }
        // Тут надо понять, установлен ли вебпак.
        const {entities} = require('../entity/all')
        // Если сюда дошли, значит PackageJson успешно загружен
        const {data} = entities.PackageJson
        const {webpack} = data.devDependencies || {}
        if (webpack) {
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
            // Установить зависимости
            let packages = 'webpack webpack-cli html-webpack-plugin clean-webpack-plugin'
            // TODO: devServer
            packages += ' webpack-dev-server'
            const cmd = makeInstallCommand(packages, true)
            wsSend('createEntityMsg', {name: this.name, message: cmd, type: 'info'})
            const {stdout, stderr} = await asyncExec(cmd)
            if (typeof stderr == 'string' && stderr.trim()) {
                wsSend('createEntityMsg', {name: this.name, message: stderr, type: 'warn'})
            }

            // html template
            const htmlName = makeSrcName('template.html')
            wsSend('createEntityMsg', {name: this.name, type: 'info',
                message: `html template: ${htmlName}`})
            const htmlData = htmlTemplate()
            await fs.promises.writeFile(htmlName, htmlData)

            // index TODO: для отладки
            const indexName = makeSrcName('index.js')
            await fs.promises.writeFile(indexName, indexTemplate())

            // webpack.config.js
            const cfgName = makeFullName('webpack.config.js')
            wsSend('createEntityMsg', {name: this.name, type: 'info',
                message: `webpack config: ${cfgName}`})
            const cfgData = cfgTemplate({
                entryExt: CommonInfo.getExtension('render'),
                title: CommonInfo.info.name,
                port: CommonInfo.extParams.port,
            })
            await fs.promises.writeFile(cfgName, cfgData)

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
}
module.exports = {WebPack}