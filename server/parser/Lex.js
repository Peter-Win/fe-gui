class Lex {
    static empty = {value: '', type: ''}
    static eol = {value: '\n', type: 'eol'}
    static spaces = value => ({value, type: 'space'})
    static space = {value: ' ', type: 'space'}
    static tab = {value: '\t', type: 'space'}
    static id = value => ({value, type: 'id'})
    static cmd = value => ({value, type: 'cmd'})
    static num = value => ({value: String(value), type: 'number'})
    static comm = value => ({value, type: 'comment'})
    static str = value => ({value, type: 'string'})
    static regexp = value => ({value, type: 'regexp'})
    static isEqual(a, b) {
        return a.value === b.value && a.text === b.text
    }
}
module.exports = {Lex}