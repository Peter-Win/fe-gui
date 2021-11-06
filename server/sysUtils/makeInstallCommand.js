const {CommonInfo} = require('../CommonInfo')
/**
 *
 * @param {string} names One or more package names, divided by space
 * @param {boolean?} isDev
 * @param {{ force?: boolean}?} options
 */
const makeInstallCommand = (names, isDev, options = {}) => {
    let cmd = ''
    if (CommonInfo.isYarn) {
        cmd = `yarn add ${names}`
        if (isDev) {
            cmd += ' --dev'
        }
    } else {
        cmd = `npm i ${names}`
        cmd += isDev ? ' -D' : ' -S'
        if (options.force) cmd += ' --force'
    }
    return cmd
}

module.exports = {makeInstallCommand}