const fs = require('fs')
const {PMgrAbs} = require('./PMgrAbs')

class PMgrNpm extends PMgrAbs {
    makeInstallAll() {
        return 'npm i'
    }
    makeInstall(packages, save, options = {}) {
        // https://docs.npmjs.com/cli/v8/commands/npm-install
        let modeOption = '-S'
        switch (save) {
            case 'dev':
                modeOption = '-D'
                break
            case 'prod':
                modeOption = '-S'
                break
            case 'none':
                modeOption = '--no-save'
                break
            case 'optional':
                modeOption: '-O'
                break
        }
        let cmd = `npm i ${packages} ${modeOption}`
        if (options.global) cmd += ' -g'
        if (options.force) cmd += ' --force'
        if (options.exact) cmd += ' -E'
        return cmd
    }

    makeRun(name) {
        if (name in {test: 1, start: 1}) {
            return `npm ${name}`
        }
        return `npm run ${name}`
    }

    /**
     * @param {string} name for ex: 'react'
     * @returns {Promise<string|null>}
     */
    async findPackageVersion(name) {
        try {
            const fname = makeFullName('package-lock.json')
            const text = await fs.promises.readFile(fname, {encoding: 'utf-8'})
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

module.exports = {PMgrNpm, findVersionInJson}