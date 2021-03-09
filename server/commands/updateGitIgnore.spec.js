const {expect} = require('chai')
const {updateGitIgnore} = require('./updateGitIgnore')

describe('updateGitIgnore', () => {
    it('empty rows', () => {
        const rows = []
        const needs = new Set(['node_modules/', '/*.log'])
        const result = updateGitIgnore(rows, needs)
        expect(result).to.eql(['node_modules/', '/*.log'])
    })
    it('typical', () => {
        const rows = ['# Ignore the node_modules directory', 'node_modules/', '# Ignore the build directory', '/dist']
        const needs = new Set(['node_modules/', '/*.log'])
        const result = updateGitIgnore(rows, needs)
        expect(result).to.eql([
            '# Ignore the node_modules directory',
            'node_modules/',
            '# Ignore the build directory',
            '/dist',
            '/*.log',
        ])
    })
})