const {exec} = require('child_process')
const {getRootPath} = require('../fileUtils')

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
            console.error(error)
            reject(new Error(`Can't execute "${command}": ${error.message}`))
        } else {
            resolve({stdout, stderr})
        }
    })
})

module.exports = {asyncExec}