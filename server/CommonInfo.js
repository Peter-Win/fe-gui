const path = require('path')
const {getRootPath} = require('./fileUtils')
const {wsSend} = require('./wsServer')

class CommonInfo {
    static glbStLoad = 'load'
    static glbStInit = 'init'
    static glbStError = 'error'
    static _globalStatus = "" // glbSt*
    static getGlobalStatus() {
        return CommonInfo._globalStatus
    }
    static setGlobalStatus(status) {
        if (status) {
            CommonInfo._globalStatus = status
        }
        wsSend('globalStatus', CommonInfo._globalStatus)
    }

    static info = {
        folderName: path.basename(getRootPath())
    }
    static send() {
        wsSend('commonInfo', CommonInfo.info)
    }
}

module.exports = {CommonInfo}