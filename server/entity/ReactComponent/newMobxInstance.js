const {instanceParams} = require('./createMobxStore')

const newMobxInstance = ({ mobxClassName, mobx }) => {
    return `new ${mobxClassName}(${instanceParams(mobx.fields).join(', ')})`
}

module.exports = {newMobxInstance}