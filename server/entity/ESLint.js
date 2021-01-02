class ESLint {
    name = 'ESLint'
    depends = []
    isInit = false
    isReady = false

    async init() {
        const {entities: {PackageJson}} = require('./all')
        this.isInit = PackageJson.isDevDependency('eslint')
        if (this.isInit) {

        } else {
            this.isReady = true
        }
    }
    description = `
<div style="color: #777;font-size: 52px;">
<img
  alt="ESLint"
  src="https://d33wubrfki0l68.cloudfront.net/204482ca413433c80cd14fe369e2181dd97a2a40/092e2/assets/img/logo.svg"
  itemprop="image"
  style="width: 51px; height: 39px;"
/>
ESLint
</div>
<div>
ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code, with the goal of making code more consistent and avoiding bugs.
</div>
<div>
You can get more details on the <a href="https://eslint.org/" target="_blank">official website of ESLint</a>.
</div>
`
}
module.exports = {ESLint}