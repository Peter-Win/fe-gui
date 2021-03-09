const {wsSend} = require('./wsServer')

/**
 *
 * @param {string} name
 * @param {string} message
 * @param {string?} type  warn | err | info | success
 */
const wsSendCreateEntity = (name, message, type) =>
    wsSend('createEntityMsg', {name, message, type})

module.exports = {wsSendCreateEntity}