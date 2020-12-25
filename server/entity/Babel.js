// yarn add --dev babel-loader @babel/core @babel/preset-env
/*
    module: {
      rules: [
        {
            test: /\.js$/,
            exclude: /(node_modules|fe-gui)/, // не хотелось бы примешивать fe-gui. Но эта папка не должна попасть в билд. Надо проверить убрать
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
//                    plugins: [],
                },
            },
        },
      ],
    },
---------------
    Jest
    jest babel-jest

    package.json
      "jest": {
    "testPathIgnorePatterns": ["/node_modules/", "/fe-gui/"]

    .babelrc
    {
  "env": {
    "test": {
      "plugins": ["@babel/plugin-transform-modules-commonjs"]
    }
  }
}
  }

*/
const {makeInstallCommand} = require('../sysUtils/makeInstallCommand')
const {wsSend} = require('../wsServer')
const {loadTemplate} = require('../sysUtils/loadTemplate')

class Babel {
    name = 'Babel'
    depends = ['WebPack']
    isInit = false

    async init() {
        this.isInit = false
    }

    async create() {
        const {entities} = require('../entity/all')
        const {WebPack} = entities
        const cmd = makeInstallCommand('babel-loader @babel/core @babel/preset-env', true)
        wsSend('createEntityMsg', {name: this.name, message: cmd, type: 'info'})
        const {stdout, stderr} = await asyncExec(cmd)
        if (typeof stderr == 'string' && stderr.trim()) {
            wsSend('createEntityMsg', {name: this.name, message: stderr, type: 'warn'})
        }
        const template = await loadTemplate('babelForWebpack.js')
        await WebPack.setPart(template)
    }
}

module.exports = { Babel }