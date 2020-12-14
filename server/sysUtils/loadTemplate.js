const fs = require('fs')
const {applyTemplate} = require('./applyTemplate')
const {makeTemplateName} = require('../fileUtils')

/**
 * Load template
 * @param {string} shortName
 * @param {Object<string,any>?} params
 * @return {Promise<string>}
 */
const loadTemplate = async (shortName, params) => {
    const text = await fs.promises.readFile(makeTemplateName(shortName)) + ''
    return applyTemplate(text, params)
}

/**
 * Build new file from template
 * @param {string} shortSrcName
 * @param {string} fullDstName
 * @param {Object<string,any>?} params
 * @return {Promise<void>}
 */
const buildTemplate = async (shortSrcName, fullDstName, params) => {
    const text = await loadTemplate(shortSrcName, params)
    await fs.promises.writeFile(fullDstName, text)
}

module.exports = {
    loadTemplate,
    buildTemplate,
}