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
 * @param {boolean=} isDev
 * @param {{ force?: boolean }=} options
 * @return {Promise<void>}
 */
const installPackage = async (name, packages, isDev = true, options = {}) => {
    const cmd = makeInstallCommand(packages, isDev, options)
    wsSend('createEntityMsg', {name, message: cmd, type: 'info'})
    const {stdout, stderr} = await asyncExec(cmd)
    if (typeof stderr == 'string' && stderr.trim()) {
        wsSend('createEntityMsg', {name, message: stderr, type: 'warn'})
    }
}

/**
 * Установка с проверкой.
 * Если все пакеты из списка уже установлены, то команда не выполняется.
 * Рекомендуется предварительно вызвать await PackageJson.load()
 * @param {string} name 
 * @param {string[]} packages 
 * @param {boolean=} isDev 
 * @param {{ force?: boolean}=} options 
 * @returns {Promise<void>}
 */
const installPackageSmart = async (name, packages, isDev = true, options = {}) => {
    const {entities: { PackageJson }} = require('../entity/all')
    const list = packages.filter(pk => isDev ? !PackageJson.isDevDependency(pk) : !PackageJson.isDependency(pk))
    if (list.length > 0) {
        await installPackage(name, list.join(' '), isDev, options)
    }
}

module.exports = {installPackage, installPackageSmart}