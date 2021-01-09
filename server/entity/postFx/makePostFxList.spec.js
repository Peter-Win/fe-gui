const {expect} = require('chai')
const {makePostFxList} = require('./makePostFxList')

const testEntities = {
    Jest: {name: 'Jest', isInit: false},
    ESLint: {name: 'ESLint', isInit: false},
    Standard: {name: 'Standard', isInit: false},
}
const postFx = [
    {ids: ['Jest', 'Standard'], key: 'Jest+Standard'},
    {ids: ['Jest', 'ESLint'], key: 'Jest+ESLint'},
]

describe('makePostFxList', () => {
    beforeAll(() => {
        Object.entries(testEntities).forEach(([, value]) => {
            value.isInit=false
        })
    })
    it('Jest+Standard', () => {
        const list1 = makePostFxList('Jest', testEntities, postFx)
        expect(list1).to.be.lengthOf(0)

        testEntities.Standard.isInit = true
        const list2 = makePostFxList('Jest', testEntities, postFx)
        expect(list2).to.be.lengthOf(1)
        expect(list2[0]).to.have.property('key', 'Jest+Standard')

        expect(makePostFxList('Standard', testEntities, postFx)).to.be.lengthOf(0)

        testEntities.ESLint.isInit = true
        expect(makePostFxList('Standard', testEntities, postFx)).to.be.lengthOf(0)

        testEntities.Jest.isInit = true
        const list3 = makePostFxList('Standard', testEntities, postFx)
        expect(list3).to.be.lengthOf(1)
        expect(list3[0].key).to.equal('Jest+Standard')

        const list4 = makePostFxList('Jest', testEntities, postFx)
        expect(list4).to.be.lengthOf(2)
        expect(list4[0].key).to.equal('Jest+Standard')
        expect(list4[1].key).to.equal('Jest+ESLint')
    })
})