const fs = require('fs')
const {isFileExists, makeFullName} = require('../fileUtils')
const {CommonInfo} = require('../CommonInfo')

class Readme {
    name = 'Readme'
    depends = []
    isInit = false
    isReady = false

    getFileName = () => makeFullName('README.md')

    async init() {
        this.isInit = await isFileExists(this.getFileName())
    }

    async create() {
        const lines = [
            `# ${CommonInfo.extParams.title || CommonInfo.info.name}`
        ]
        if (CommonInfo.info.description) {
            lines.push(CommonInfo.info.description)
        }
        const text = lines.join('\n\n')
        await fs.promises.writeFile(this.getFileName(), text)
    }

    /**
     * @param {function(lines:string[]):string[]} callback
     * @return {Promise<void>}
     */
    async update(callback) {
        const text = await fs.promises.readFile(this.getFileName())
        const src = text.toString().split('\n').map(s => s.replace('\r', ''))
        const dst = callback(src)
        await fs.promises.writeFile(this.getFileName(), dst.join('\n'))
    }

    /**
     * Add badge. Use as callback for Readme.update
     * @param {string[]} list
     * @param {string} badgeLine Example: '[![npm][npm-image]][npm-url]'
     * @return {string[]}
     */
    addBadge(list, badgeLine) {
        const hdrPos = list.findIndex(s => /^# /.test(s))
        let badgePos = hdrPos < 0 ? 0 : hdrPos + 1
        while (badgePos < list.length && list[badgePos][0] === '[') badgePos++
        list.splice(badgePos, 0, badgeLine)
        return list
    }
}
module.exports = {Readme}