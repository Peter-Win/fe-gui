const {makeComponentCall} = require('./makeComponentCall')
const {newMobxInstance} = require('./newMobxInstance')

const mainFrameUpdate = ({ name, folder, props, mobx, mobxClassName, mobxStoreName }) => {
    const importFile = `${folder}/${name}`
    const fromFile = [name]
    let beforeComp = ''
    let storeName = ''
    if (mobxClassName) {
        fromFile.push(mobxStoreName || mobxClassName)
        if (mobxStoreName) {
            storeName = mobxStoreName
        } else {
            storeName = `local${mobxClassName}`
            beforeComp = `const ${storeName} = ${newMobxInstance({mobxClassName, mobx})};`
        }
    }

    return {
        header: `import { ${fromFile.join(', ')} } from ".${importFile.slice(3)}";`,
        code: '\n'+makeComponentCall({ name, props, mobxStoreName: storeName }),
        beforeComp,
    }
}

module.exports = { mainFrameUpdate }