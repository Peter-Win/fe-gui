const {asyncExec} = require('../sysUtils/asyncExec')
const {wsSend} = require('../wsServer')

class Yarn {
    name = 'Yarn'
    depends = ['PackageJson']
    isInit = false
    async init() {

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