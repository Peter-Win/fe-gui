const {asyncExec} = require('../sysUtils/asyncExec')
const {wsSend} = require('../wsServer')
const {makeFullName, isFileExists} = require('../fileUtils')
const {CommonInfo} = require('../CommonInfo')
const {readRows} = require('../sysUtils/textFile')

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

    /**
     * @param {string} name for ex: 'react'
     * @returns {Promise<string|null>}
     */
    async findPackageVersion(name) {
        try {
            const fname = makeFullName('yarn.lock')
            return findVersionInRows(await readRows(fname), name)
        } catch (e) {
            return null
        }
    }
}

const findVersionInRows = (rows, name) => {
    const need = name[0] === '@' ? `"${name}@` : `${name}@`
    let pos = rows.findIndex(row => row.startsWith(need))
    if (pos < 0) return null
    pos++
    while (pos < rows.length && /^  [a-z]/.test(rows[pos])) {
        if (rows[pos].startsWith('  version')) {
            const res = /(".*")/.exec(rows[pos])
            if (res && res[0][0]==='"') {
                return res[0].slice(1, -1)
            }
        }
        pos++
    }
    return null
}

module.exports = {Yarn, findVersionInRows}