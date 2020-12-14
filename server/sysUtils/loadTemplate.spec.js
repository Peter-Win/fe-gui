const {expect} = require('chai')
const {loadTemplate} = require('./loadTemplate')

it('loadTemplate', async () => {
    const text = await loadTemplate('test.json', {first: 'A', second: 'B'})
    expect(JSON.parse(text)).to.eql({first: 'A', second: 'B'})

    const text2 = await loadTemplate('test.json', {first: 'hello', second: 'world'})
    expect(JSON.parse(text2)).to.eql({first: 'hello', second: 'world'})
})