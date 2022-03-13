const {jestStandard} = require('./jestStandard')
const {jestESLint} = require('./jestESLint')
const {gitIgnoreUpdate} = require('./gitIgnoreUpdate')
const {storybookLess} = require('./storybookLess')
const {storybookESLint} = require('./storybookESLint')
const {aliasesESLint} = require('./aliasesESLint')
const {aliasesTypeScript} = require('./aliasesTypeScript')

/**
 * @type {Array<{ids: string[], fn: function(name:string, entities:Object<string, {}>):Promise<void>}>}
 */
const postFx = [
    {ids: ['Aliases', 'ESLint'], fn: aliasesESLint},
    {ids: ['Aliases', 'TypeScript'], fn: aliasesTypeScript},
    {ids: ['ESLint', 'Git'], fn: gitIgnoreUpdate},
    {ids: ['ESLint', 'Storybook'], fn: storybookESLint},
    {ids: ['Git', 'Jest'], fn: gitIgnoreUpdate},
    {ids: ['Jest', 'ESLint'], fn: jestESLint},
    {ids: ['Jest', 'Standard'], fn: jestStandard},
    {ids: ['LESS', 'Storybook'], fn: storybookLess},
]

module.exports = {postFx}