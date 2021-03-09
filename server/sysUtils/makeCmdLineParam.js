/**
 * Make string parameter of command line.
 * For example Comment in: git commit -m "Comment"
 * @param {string} text
 * @param {boolean=} strictQuotes
 */
const makeCmdLineParam = (text, strictQuotes = true) => {
    const useQuotes = strictQuotes || (text.length === 0 || /[ \n\t\r\"]/.test(text))
    const result = ['\"', 'n', 'r', 't'].reduce((str, chr) =>
        str.replace(new RegExp(`\\${chr}`, 'g'), `\\${chr}`), text)
    return useQuotes ? `"${result}"` : result;
}
module.exports = {makeCmdLineParam}