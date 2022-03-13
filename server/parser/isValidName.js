/**
 * Имя переменной должно содержать только буквы, цифры или символы $ и _. 
 * Первый символ не должен быть цифрой.
 * @param {string} name Имя
 * @returns {boolean}
 */
const isValidName = (name) =>
    /^[a-z_\$][a-z\d_\$]*$/i.test(name)

module.exports = {isValidName}