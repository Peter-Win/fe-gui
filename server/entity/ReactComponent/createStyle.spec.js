const {expect} = require('chai')
const {createStyle} = require('./ReactComponent.utils')

const styleBody = (className) => [
    `.${className} {`,
    '  margin: 0;',
    '}'
]

describe('createStyle', () => {
    it('None', () => {
        const res = createStyle({name: 'MyComponent', styles: ''})
        expect(res).to.deep.equal({ className: '', classExpr: '', styleImport: '', styleCode: [], styleFileName: ''})
    })
    it('CSS', () => {
        const res = createStyle({name: 'MyComponent', styles: 'css'})
        expect(res.className).to.equal('my-component')
        expect(res.classExpr).to.equal(' className="my-component"')
        expect(res.styleImport).to.equal('import "./MyComponent.css";')
        expect(res.styleFileName).to.equal('MyComponent.css')
        expect(res.styleCode).to.deep.equal(styleBody('my-component'))
    })
    it('LESS', () => {
        const res = createStyle({name: 'MyComponent', styles: 'less'})
        expect(res.className).to.equal('my-component')
        expect(res.classExpr).to.equal(' className="my-component"')
        expect(res.styleImport).to.equal('import "./MyComponent.less";')
        expect(res.styleFileName).to.equal('MyComponent.less')
        expect(res.styleCode).to.deep.equal(styleBody('my-component'))
    })
    it('CSS Module', () => {
        const res = createStyle({name: 'MyComponent', styles: 'module.css'})
        expect(res.className).to.equal('myComponent')
        expect(res.classExpr).to.equal(' className={styles.myComponent}')
        expect(res.styleImport).to.equal('import styles from "./MyComponent.module.css";')
        expect(res.styleFileName).to.equal('MyComponent.module.css')
        expect(res.styleCode).to.deep.equal(styleBody('myComponent'))
    })
    it('LESS Module', () => {
        const res = createStyle({name: 'MyComponent', styles: 'module.less'})
        expect(res.className).to.equal('myComponent')
        expect(res.classExpr).to.equal(' className={styles.myComponent}')
        expect(res.styleImport).to.equal('import styles from "./MyComponent.module.less";')
        expect(res.styleFileName).to.equal('MyComponent.module.less')
        expect(res.styleCode).to.deep.equal(styleBody('myComponent'))
    })
    it('LESS Module 7', () => {
        const res = createStyle({name: 'MyComponent', styles: 'module.less', cssLoaderVer: '7.1.2'})
        expect(res.className).to.equal('myComponent')
        expect(res.classExpr).to.equal(' className={styles.myComponent}')
        expect(res.styleImport).to.equal('import * as styles from "./MyComponent.module.less";')
        expect(res.styleFileName).to.equal('MyComponent.module.less')
        expect(res.styleCode).to.deep.equal(styleBody('myComponent'))
    })
})
