const {asyncExecShell} = require('../sysUtils/asyncExec')
const {wsSendCreateEntity} = require('../wsSend')
const {makeFullName, isFileExists} = require('../fileUtils')
const {CommonInfo} = require('../CommonInfo')
const {PMgrYarn} = require('../packageManagers/PMgrYarn')

class Yarn {
    name = 'Yarn'
    depends = ['PackageJson']
    isInit = false
    async init() {
        this.isInit = false
        const fileName = makeFullName('yarn.lock')
        if (await isFileExists(fileName)) {
            this.isInit = true
            CommonInfo.tech.packageManager = 'Yarn'
            CommonInfo.packageManager = this.createManager()
        }
    }
    createManager() {
        return new PMgrYarn()
    }
    async create() {
        // Сначала была идея проверять установку yarn через npm list -g --json --depth=0
        // Но потом появилась идея лучше: сразу вызывать npm -g i yarn
        // Потому что даже если ярн установлен, то он обновится до последнй версии
        await asyncExecShell(this.name, 'npm -g i yarn --json')
    }
}

module.exports = {Yarn}