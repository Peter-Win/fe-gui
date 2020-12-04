const {exec} = require('child_process')

/**
 *
 * @param {string} command
 * @param {object?} options
 * @return {Promise<{stdout,stderr:string|Buffer}>}
 */
const asyncExec = (command, options) => new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
        if (error) {
            reject(error)
        } else {
            resolve({stdout, stderr})
        }
    })
})

module.exports = {asyncExec}