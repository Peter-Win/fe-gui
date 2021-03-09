const {jestStandard} = require('./jestStandard')
const {jestESLint} = require('./jestESLint')
const {gitIgnoreUpdate} = require('./gitIgnoreUpdate')

/**
 * @type {Array<{ids: string[], fn: function(name:string, entities:Object<string, {}>):Promise<void>}>}
 */
const postFx = [
    {ids: ['Jest', 'Standard'], fn: jestStandard},
    {ids: ['Jest', 'ESLint'], fn: jestESLint},
    {ids: ['Git', 'ESLint'], fn: gitIgnoreUpdate},
    {ids: ['Git', 'Jest'], fn: gitIgnoreUpdate},
]

module.exports = {postFx}