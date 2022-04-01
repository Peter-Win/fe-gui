const fs = require('fs')
const {makeFullName} = require('../../fileUtils')

class NPM {
    name = 'NPM'
    isInit = true
    isReady = false
    depends = []

    async init() {

    }
    async create() {
        
    }

    /**
     * @param {string} name for ex: 'react'
     * @returns {Promise<string|null>}
     */
     async findPackageVersion(name) {
        try {
            const fname = makeFullName('package-lock.json')
            console.log('fname', fname)
            const text = await fs.promises.readFile(fname, {encoding: 'utf-8'})
            console.log('text loaded')
            return findVersionInJson(JSON.parse(text), name)
        } catch (e) {
            console.error(e)
        }
        return null
    }

}

/**
 * Поиск версии пакета в package-lock.json
 * @param {JSON} json 
 * @param {string} name 
 * @returns {string|null} For ex '1.2.3'
 */
const findVersionInJson = (json, name) => {
    const {packages} = json
    const key = `node_modules/${name}`
    const info = packages[key]
    if (!info) return null
    return info.version || null
}

module.exports = {NPM, findVersionInJson}