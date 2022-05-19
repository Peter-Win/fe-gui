/*
 * Utilities for tsconfig.json
 */

/**
 * Add value to compilerOptions.types with prevent of duplication
 * @param {JSON} config IN/OUT
 * @param {string} type 
 */
const addType = (config, type) => {
    config.compilerOptions = config.compilerOptions || {}
    const { compilerOptions } = config
    const typesSet = new Set(compilerOptions.types || [])
    typesSet.add(type)
    compilerOptions.types = Array.from(typesSet)
}

module.exports = { addType }