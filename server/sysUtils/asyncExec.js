const {exec} = require('child_process')
const {getRootPath} = require('../fileUtils')
const {wsSendCreateEntity} = require('../wsSend')

/**
 *
 * @param {string} command
 * @param {object?} options
 * @return {Promise<{stdout,stderr:string|Buffer}>}
 */
const asyncExec = (command, options) => new Promise((resolve, reject) => {
    if (!options) {
        options = {cwd: getRootPath()}
    }
    exec(command, options, (error, stdout, stderr) => {
        if (error) {
            reject(new Error(`Can't execute "${command}": ${error.message}`))
        } else {
            resolve({stdout, stderr})
        }
    })
})

/**
 * 
 * @param {string|null} name 
 * @param {string} command 
 * @param {object?} options 
 * @returns {string?} stdout
 */
const asyncExecShell = async (name, command, options) => {
    const log = (msg, type) => {
        if (name) wsSendCreateEntity(name, msg, type)
    }
    try {
        log(command, 'info')
        const {stderr, stdout} = await asyncExec(command, options)
        if (stderr) {
            log(stderr, 'warn')
        }
        return {stdout}
    } catch (e) {
        log(e.message, 'err')
        throw e
    }
}

module.exports = {asyncExec, asyncExecShell}