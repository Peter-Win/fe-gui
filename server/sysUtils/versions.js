/**
 * @param {string|null} version format: '17.0.2'
 * @param {number} defaultValue
 * @returns {number}
 */
const getHiVersion = (version, defaultValue) => {
    return +(version || '').split('.')[0] || defaultValue
}

module.exports = { getHiVersion }