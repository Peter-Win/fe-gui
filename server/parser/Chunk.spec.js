const {expect} = require('chai')
const {Chunk} = require('./Chunk')

describe('Chunk', () => {
    it('makeList', () => {
        const items = [Chunk.name('a'), [Chunk.name('b'), Chunk.binop('+'), Chunk.Const(1)]]
        const list = Chunk.makeList(items, Chunk.paramsBegin, Chunk.paramsEnd, Chunk.paramDiv, Chunk.paramDivLast)
        expect(list.reduce((acc, it) => acc + it[0], '')).to.equal('(a, b + 1)')
        expect(list).to.eql([
            Chunk.paramsBegin,
            Chunk.name('a'),
            Chunk.paramDiv,
            Chunk.name('b'),
            Chunk.binop('+'),
            Chunk.Const(1),
            Chunk.paramDivLast,
            Chunk.paramsEnd
        ])
    })
})