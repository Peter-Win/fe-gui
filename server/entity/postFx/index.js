const {aliasesJest} = require('./aliasesJest')
const {jestStandard} = require('./jestStandard')
const {jestESLint} = require('./jestESLint')
const {jestSwc} = require('./jestSwc')
const {jestTypeScript} = require('./jestTypeScript')
const {gitIgnoreUpdate} = require('./gitIgnoreUpdate')
const {storybookLess} = require('./storybookLess')
const {storybookESLint} = require('./storybookESLint')
const {aliasesESLint} = require('./aliasesESLint')
const {aliasesTypeScript} = require('./aliasesTypeScript')
const {cssModulesJest} = require('./cssModulesJest')
const {cssModulesLess} = require('./cssModuleLess')

/**
 * @type {Array<{ids: string[], fn: function(name:string, entities:Object<string, {}>):Promise<void>}>}
 */
const postFx = [
    {ids: ['Aliases', 'ESLint'], fn: aliasesESLint},
    {ids: ['Aliases', 'Jest'], fn: aliasesJest },
    {ids: ['Aliases', 'TypeScript'], fn: aliasesTypeScript},
    {ids: ['CssModules', 'Jest'], fn: cssModulesJest},
    {ids: ['CssModules', 'LESS'], fn: cssModulesLess},
    {ids: ['ESLint', 'Git'], fn: gitIgnoreUpdate},
    {ids: ['ESLint', 'Storybook'], fn: storybookESLint},
    {ids: ['Git', 'Jest'], fn: gitIgnoreUpdate},
    {ids: ['Jest', 'ESLint'], fn: jestESLint},
    {ids: ['Jest', 'Standard'], fn: jestStandard},
    {ids: ['Jest', 'SWC'], fn: jestSwc},
    {ids: ['Jest', 'TypeScript'], fn: jestTypeScript},
    {ids: ['LESS', 'Storybook'], fn: storybookLess},
]

module.exports = {postFx}