const isImport = row =>
    row.startsWith('import') |
    /^const\s*.+\s*=\s*require\(.+\)$/.test(row)

/**
 *
 * @param {string[]} rows IN/OUT
 * @param {string} importCmd
 */
const injectImport = (rows, importCmd) => {
    let i, pos = 0, state = 'begin'
    for (i = 0; i < rows.length && state !== 'break'; i++) {
        const line = rows[i].trim()
        if (state === 'begin' || state === 'import') {
            if (line === '') {
                state = 'begin'
            } else if (line.startsWith('import')) {
                if (line.indexOf('{') > 0) {
                    if (line.indexOf('}') > 0) {
                        state = 'import'    // import {...} from ...
                    } else {
                        state = 'continue'  // import {
                    }
                } else {
                    // import "name" OR import name from "name"
                    state = 'import'
                }
            } else if (/^const\s*.+\s*=\s*require\(.+\);?$/.test(line)) {
                state = 'import'
            } else if (line.startsWith('const') && line.indexOf('{')>0 && line.indexOf('}')<0) {
                state = 'maybe'
            } else {
                state = 'break'
            }
        } else if (state === 'continue') {
            if (line.indexOf('}') >=0) state = 'import'
        } else if (state === 'maybe') {
            if (/}\s*=\s*require\s*\(/.test(line)) state = 'import'
            else if (line.indexOf('}') >= 0) state = 'break'
        }
        if (state === 'import') pos = i + 1
    }
    rows.splice(pos, 0, importCmd)
}

module.exports = {injectImport}