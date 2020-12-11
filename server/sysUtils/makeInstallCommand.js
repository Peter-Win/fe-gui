const {CommonInfo} = require('../CommonInfo')
/**
 *
 * @param {string} names One or more package names, divided by space
 * @param {boolean?} isDev
 */
const makeInstallCommand = (names, isDev) => {
    let cmd = ''
    if (CommonInfo.isYarn) {
        cmd = `yarn add ${names}`
        if (isDev) {
            cmd += ' --dev'
        }
    } else {
        cmd = `npm i ${names}`
        cmd += isDev ? ' -D' : ' -S'
    }
    return cmd
}

module.exports = {makeInstallCommand}