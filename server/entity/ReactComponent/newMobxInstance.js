const newMobxInstance = ({ mobxClassName }) => {
    return `new ${mobxClassName}()`
}

module.exports = {newMobxInstance}