const fs = require('fs')
const {makeFullName, isFileExists} = require('../fileUtils')
const {CommonInfo} = require('../CommonInfo')
const {PMgrNpm} = require('../packageManagers/PMgrNpm')

class NPM {
    name = 'NPM'
    isInit = false
    isReady = false
    depends = []

    async init() {
        this.isInit = false
        if (await isFileExists(makeFullName('package-lock.json'))) {
            this.isInit = true
            CommonInfo.tech.packageManager = this.name
            CommonInfo.packageManager = this.createManager()
        }
    }
    async create() {
        
    }

    createManager() {
        return new PMgrNpm()
    }
}

module.exports = {NPM}