const { PMgrAbs } = require("./PMgrAbs");
const {readRows} = require('../sysUtils/textFile')

class PMgrYarn extends PMgrAbs {
    makeInstallAll() {
        return 'yarn'
    }

    makeInstall(packages, save = 'prod', options = {}) {
        // https://classic.yarnpkg.com/lang/en/docs/cli/add/
        let cmd = 'yarn'
        if (options.global) cmd += ' global'
        cmd += ` add ${packages}`
        switch (save) {
            case 'dev':
            case 'peer':
            case 'optional':
                cmd += ` --${save}`
                break
        }
        if (options.exact) cmd += ' -E'
        return cmd
    }

    makeRun(name) {
        return `yarn ${name}`
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

module.exports = {PMgrYarn, findVersionInRows}