'use strict'
const {wsSend} = require('../wsServer')
const {asyncExec} = require('../sysUtils/asyncExec')
const {makeInstallCommand} = require('../sysUtils/makeInstallCommand')

/**
 * Установить пакет
 * Example:
 *     await installPackage('WebPack', 'webpack webpack-cli')
 * @param {string} name Наименование раздела
 * @param {string} packages Одно или несколько имен пакетов (через пробел)
 * @return {Promise<void>}
 */
const installPackage = async (name, packages) => {
    const cmd = makeInstallCommand(packages, true)
    wsSend('createEntityMsg', {name, message: cmd, type: 'info'})
    const {stdout, stderr} = await asyncExec(cmd)
    if (typeof stderr == 'string' && stderr.trim()) {
        wsSend('createEntityMsg', {name, message: stderr, type: 'warn'})
    }
}

module.exports = {installPackage}