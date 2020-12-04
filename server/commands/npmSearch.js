const {asyncExec} = require('../sysUtils/asyncExec')

/**
 * call npm search <name>
 * @param {string} name
 * @return {Promise<Array<{name,scope,version,description,date:string}>>}
 * @throws If the name contains invalid characters, an exception will be thrown
 *
 * Example: [{
    "name": "fe",
    "scope": "unscoped",
    "version": "2.0.27",
    "description": "Front-End workflow & stack",
    "date": "2018-06-27T09:03:38.359Z",
    "links": { "npm": "https://www.npmjs.com/package/fe" },
    "publisher": {
      "username": "leecade",
      "email": "leecade@163.com"
    },
    "maintainers": [{"username": "leecade", "email": "leecade@163.com"}]
  }]
 */
const npmSearch = async (name) => {
    const {stdout} = await asyncExec(`npm search ${name} --json`)
    return JSON.parse(stdout)
}

module.exports = {npmSearch}