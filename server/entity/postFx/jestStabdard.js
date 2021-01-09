/**
 * Jest and Standard
 */
const {wsSend} = require('../../wsServer')
module.exports.jestStandard = async (name, entities) => {
    wsSend('createEntityMsg', {name, message: 'Update package.json'})
    const {PackageJson} = entities
    await PackageJson.update((pj) => {
        const {standard} = pj.data
        standard.envs = standard.envs || []
        if (!standard.envs.includes('jest')) {
            standard.envs.push('jest')
        }
    })
}