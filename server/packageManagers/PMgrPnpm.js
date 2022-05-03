const { PMgrAbs } = require("./PMgrAbs");
const { readRows } = require('../sysUtils/textFile')
const { makeFullName } = require('../fileUtils')

class PMgrPnpm extends PMgrAbs {
    makeInstallAll() {
        return 'pnpm i'
    }
    makeInstall(packages, save, options = {}) {
        let cmd = `pnpm add ${packages}`
        switch (save) {
            case 'prod':
                cmd += ' -P'
                break
            case 'dev':
                cmd += ' -D'
                break
            case 'optional':
                cmd += ' -O'
                break
            case 'peer':
                cmd += ' --save-peer'
                break
        }
        if (options.global) cmd += ' -g'
        if (options.exact) cmd += ' -E'
        return cmd
    }

    makeRun(name) {
        const run = name in {test: 1, start: 1} ? '' : ' run'
        return `pnpm${run} ${name}`
    }

    makeNpx(commandLine) {
        return `pnpx ${commandLine}`
    }

    async findPackageVersion(name) {
        try {
            const fname = makeFullName('pnpm-lock.yaml')
            return findVersionInYaml(await readRows(fname), name)
        } catch (e) {
            return null
        }
    }
}

const findVersionInYaml = (rows, name) => {
    const rx = new RegExp(`^  ${name}: ([\\d\\.]+)$`)
    const res = rows.find(row => rx.test(row))
    if (res) return rx.exec(res)[1]
    return null
}

module.exports = {PMgrPnpm, findVersionInYaml}