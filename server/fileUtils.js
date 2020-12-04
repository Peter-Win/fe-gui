const path = require('path')

const getRootPath = () =>
    path.normalize(path.join(__dirname, '..', '..'))

const makeFullName = (shortName) =>
    path.normalize(path.join(getRootPath(), shortName))

module.exports = {
    getRootPath,
    makeFullName,
}