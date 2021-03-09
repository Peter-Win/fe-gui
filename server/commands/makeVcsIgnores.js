/**
 * Собрать список файлов(папок), игнорируемых системой контроля версий
 * @return {Set<string>}
 */
const makeVcsIgnores = () => {
    const {entities} = require('../entity/all')
    const ignores = new Set(['/fe-gui', 'node_modules/', '/dist', '.idea/', '.vscode/', '/*.log'])
    Object.values(entities).forEach(ent => {
        if (ent.isInit && ent.vcsIgnore) {
            ent.vcsIgnore(ignores)
        }
    })
    return ignores
}

module.exports = {makeVcsIgnores}