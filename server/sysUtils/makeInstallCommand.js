const {CommonInfo} = require('../CommonInfo')
/**
 *
 * @param {string} names One or more package names, divided by space
 * @param {boolean?} isDev
 * @param {{ force?: boolean}?} options
 */
const makeInstallCommand = (names, isDev, options = {}) => {
    return CommonInfo.packageManager.makeInstall(names, isDev ? 'dev' : 'prod', options)
}

module.exports = {makeInstallCommand}