const {jestStandard} = require('./jestStandard')
const {jestESLint} = require('./jestESLint')
const {gitIgnoreUpdate} = require('./gitIgnoreUpdate')
const {storybookLess} = require('./storybookLess')
const {storybookESLint} = require('./storybookESLint')

/**
 * @type {Array<{ids: string[], fn: function(name:string, entities:Object<string, {}>):Promise<void>}>}
 */
const postFx = [
    {ids: ['Jest', 'Standard'], fn: jestStandard},
    {ids: ['Jest', 'ESLint'], fn: jestESLint},
    {ids: ['Git', 'ESLint'], fn: gitIgnoreUpdate},
    {ids: ['Git', 'Jest'], fn: gitIgnoreUpdate},
    {ids: ['LESS', 'Storybook'], fn: storybookLess},
    {ids: ['ESLint', 'Storybook'], fn: storybookESLint},
]

module.exports = {postFx}