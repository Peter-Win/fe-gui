const {asyncExec} = require('../sysUtils/asyncExec')
const {wsSend} = require('../wsServer')
const {makeFullName, isFileExists} = require('../fileUtils')
const {CommonInfo} = require('../CommonInfo')

class Yarn {
    name = 'Yarn'
    depends = ['PackageJson']
    isInit = false
    async init() {
        this.isInit = false
        const fileName = makeFullName('yarn.lock')
        if (await isFileExists(fileName)) {
            CommonInfo.tech.packageManager = 'Yarn'
            wsSend('statusMessage', {text: 'Yarn detected'})
        }
        // Даже если не обнаружено, то все равно инициализация прошла. Чтобы не стопить цикл инициализации.
        // А признак использования Yarn нужно смотреть в CommonInfo
        this.isInit = true
    }
    async create() {
        // Сначала была идея проверять установку yarn через npm list -g --json --depth=0
        // Но потом появилась идея лучше: сразу вызывать npm -g i yarn
        // Потому что даже если ярн установлен, то он обновится до последнй версии
        try {
            const cmd = 'npm -g i yarn --json'
            wsSend('createEntityMsg', {name: this.name, message: cmd, type: 'info'})
            const {stderr} = await asyncExec(cmd)
            if (stderr) {
                wsSend('createEntityMsg', {name: this.name, message: stderr, type: 'warn'})
            }
        } catch (e) {
            throw e
        }
    }
}

module.exports = {Yarn}