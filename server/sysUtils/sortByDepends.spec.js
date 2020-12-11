const {expect} = require('chai')
const {sortByDepends} = require('./sortByDepends')

describe('sortByDepends', () => {
    it('reverse', () => {
        const entities = {
            third: {name: 'third', depends: ['second']},
            second: {name: 'second', depends: ['first']},
            first: {name: 'first', depends: []},
        }
        const img = JSON.stringify(entities)
        expect(sortByDepends(entities)).to.eql([
            {name: 'first', depends: []},
            {name: 'second', depends: ['first']},
            {name: 'third', depends: ['second']},
        ])
        // Исходный объект не должен измениться
        expect(JSON.stringify(entities)).to.equal(img)
    })
    it('multi depends', () => {
        const entities = {
            C: {name: 'C', depends: ['A', 'B']},
            B: {name: 'B', depends: []},
            A: {name: 'A', depends: []},
        }
        expect(sortByDepends(entities)).to.eql([
            {name: 'A', depends: []},
            {name: 'B', depends: []},
            {name: 'C', depends: ['A', 'B']},
        ])
    })
})