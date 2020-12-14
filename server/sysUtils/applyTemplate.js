/**
 * Apply template
 * @param {string} template
 * @param {Object<string, any>?} params
 */
module.exports.applyTemplate = (template, params = {}) =>
    template.split('<%=').map((piece, j) => {
        const chunks = piece.split('%>')
        if (chunks.length === 2) {
            const key = chunks[0].trim()
            const value = params[key]
            if (value !== undefined) {
                return value + chunks[1]
            }
        }
        return j === 0 ? piece : `<%=${piece}`
    }).join('')