const {isFileExists, makeFullName} = require('../fileUtils')
const {CommonInfo} = require('../CommonInfo')
const {asyncExecShell} = require('../sysUtils/asyncExec')
const {PMgrPnpm} = require('../packageManagers/PMgrPnpm')

class Pnpm {
    name = 'pnpm'
    isInit = false
    isReady = false
    depends = []

    async init() {
        if (await isFileExists(makeFullName('pnpm-lock.yaml'))) {
            this.isInit = true
            CommonInfo.tech.packageManager = this.name
            CommonInfo.packageManager = this.createManager()
        }
    }
    
    async create() {
        await asyncExecShell(this.name, 'npm i -g pnpm --json')
    }

    createManager() {
        return new PMgrPnpm()
    }
}

module.exports = {Pnpm}