const path = require('path')
const {wsSend} = require('./wsServer')

class CommonInfo {
    static _globalStatus = "" // load
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
        folderName: path.basename(path.normalize(path.join(__dirname, '..', '..')))
    }
    static send() {
        wsSend('commonInfo', CommonInfo.info)
    }
}

module.exports = {CommonInfo}