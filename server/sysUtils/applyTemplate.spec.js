const {expect} = require('chai')
const {applyTemplate} = require('./applyTemplate')

it('applyTemplate', () => {
    expect(applyTemplate('hello')).to.equal('hello')
    expect(applyTemplate('Hello, <%= A %>!', {A: 'World'})).to.equal('Hello, World!')
    expect(applyTemplate('Hello, <%=A%>!', {A: 'world'})).to.equal('Hello, world!')
    expect(applyTemplate('<%= a %> = <%= b %>', {a: 'left', b: 'right'})).
        to.equal('left = right')
    expect(applyTemplate('abc <%= xyz')).to.equal('abc <%= xyz')

    expect(applyTemplate('<%= x %> = <%= y %>')).to.equal('<%= x %> = <%= y %>')
    expect(applyTemplate('<%= x %> = <%= y %>', {y: 'y'})).to.equal('<%= x %> = y')
    expect(applyTemplate('<%= x %> = <%= y %>', {x: 'x'})).to.equal('x = <%= y %>')
    expect(applyTemplate('<%= x %> = <%= y %>', {x: 'x', y: 'y'})).to.equal('x = y')
})