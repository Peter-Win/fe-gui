class PMgrAbs {
    /**
     * 
     * @param {string} packages 
     * @param {"prod"|"dev"|"none"|"optional"|"peer"} save 
     * @param {Object?} options
     * @param {boolean?} options.force
     * @param {boolean?} options.global
     * @param {boolean?} optional.exact
     * @returns {string}
     */
    makeInstall(packages, save = 'prod', options = {}) {
        throw new Error('PMgrAbs.makeInstall must be overriden')
    }

    /**
     * @returns {string}
     */
    makeInstallAll() {
        throw new Error('PMgrAbs.makeInstallAll must be overriden')
    }

    /**
     * @param {string} name 
     * @returns {string} Example: 'yarn start' or 'npm run build'
     */
    makeRun(name) {
        throw new Error('PMgrAbs.makeRun must be overriden')
    }

    makeNpx(commandLine) {
        return `npx ${commandLine}`
    }

    /**
     * @param {string} name for ex: 'react'
     * @returns {Promise<string|null>}
     */
    async findPackageVersion(name) {
        throw new Error(`PMgrAbs.findPackageVersion must be overriden`)
    }
}
module.exports = {PMgrAbs}