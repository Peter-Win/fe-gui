const {jestStandard} = require('./jestStabdard')
const {jestESLint} = require('./jestESLint')

/**
 * @type {Array<{ids: string[], fn: function(name:string, entities:Object<string, {}>):Promise<void>}>}
 */
const postFx = [
    {ids: ['Jest', 'Standard'], fn: jestStandard},
    {ids: ['Jest', 'ESLint'], fn: jestESLint},
]

module.exports = {postFx}