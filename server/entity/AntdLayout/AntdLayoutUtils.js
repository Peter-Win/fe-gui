const {Chunk} = require('../../parser/Chunk')
const {formatChunksEx} = require('../../parser/formatChunksEx')
const {injectImport} = require('../../parser/injectImport')

/**
 * update App.tsx / App.jsx
 * Рекомендуется проверять, что locale не пусто, до загрузки файла
 * @param {string[]} rows
 * @param {{locale:string}} params
 */
const updateApp = (rows, params) => {
    if (!params.locale) return
    const localeName = params.locale.replace('_', '')
    // Не производится полноценный парсинг.
    // Поэтому не получится корректно отработать случаи, когда импорт разбит на несколько строк.
    // В общем, если в файле присутствует тег ConfigProvider, то вообще файл не трогаем.
    if (rows.find(r => r.indexOf('<ConfigProvider') >= 0)) return
    const mfTag = '<MainFrame'
    const mfPos = rows.findIndex(r => r.indexOf(mfTag) >= 0)
    if (mfPos < 0) return
    const margin = rows[mfPos].indexOf(mfTag)
    const space = ' '.repeat(margin)
    rows[mfPos] = '  ' + rows[mfPos]
    rows.splice(mfPos + 1, 0, `${space}</ConfigProvider>`)
    rows.splice(mfPos, 0, `${space}<ConfigProvider locale={${localeName}}>`)
    injectImport(rows, `import { ConfigProvider } from 'antd';`)
    injectImport(rows, `import ${localeName} from 'antd/lib/locale/${params.locale}';`)
}

/**
 * @param {string[]} rows
 * @param {{theme:string, useSider:boolean, useHeader: boolean, useMenu: boolean}} params
 */
const updateStyle = (rows, params) => {
    if (params.theme) {
        let commImpPos = rows.findIndex(row => /^@import [\'\"]~antd\/dist\/antd\.less/.test(row))
        if (commImpPos < 0) {
            commImpPos = 0
            rows.unshift("@import '~antd/dist/antd.less';")
        }
        rows.splice(
            commImpPos + 1,
            0,
            `@import '~antd/lib/style/themes/${params.theme}.less';`
        )
    }
    let primColPos = rows.findIndex(row => row.startsWith('@primary-color'))
    if (primColPos < 0) {
        rows.push('@primary-color: @blue-base;')
        primColPos = rows.length
    } else {
        primColPos++
    }
    if (params.useSider && params.useMenu && !rows.find(r => r.indexOf('@layout-sider-background') > 0)) {
        rows.splice(primColPos, 0, "@layout-sider-background: @menu-bg;")
        primColPos++
    }
    if (params.useHeader && params.useMenu && !rows.find(r => r.indexOf('@layout-header-background') > 0)) {
        rows.splice(primColPos, 0, "@layout-header-background: @menu-bg;")
        primColPos++
    }
    if (!rows.find(r => r.indexOf('.main-layout') > 0)) {
        rows.push('', '.main-layout { min-height: 100vh; }')
    }
}

/**
 * MainFrame This file is always generated entirely from scratch.
 * @param {Object} params
 * @param {boolean} params.useHeader
 * @param {boolean} params.useSider
 * @param {boolean} params.useFooter
 * @param {boolean} params.useMenu
 * @param {'header'|'sider'} params.menuPos
 * @param {'outside'|'inside'} params.siderPos
 * @param {string} params.theme
 *
 * @param {Style} style
 * @param {string} language
 * @return {string}
 */
const makeMainFrame = (params, style, language) => {
    const isTS = language === 'TypeScript'
    const chunks = []
    const drawMenu = (mode) => {
        if (!params.useMenu) return
        if (mode === 'vert' && params.menuPos !== 'sider') return
        if (mode === 'horiz' && params.menuPos !== 'header') return
        chunks.push(Chunk.beginTag('Menu'))
        if (mode === 'horiz') chunks.push(...Chunk.attr('mode', 'horizontal', style))
        chunks.push(...Chunk.attrExt('defaultSelectedKeys', [
            Chunk.arrayBegin, Chunk.Const(style.string('1')), Chunk.arrayEnd,
        ]))
        chunks.push(Chunk.endTag(), Chunk.eol);
        [['1', 'First'], ['2', 'Second'], ['3', 'Third']].forEach(([key, text]) => {
            chunks.push(
                Chunk.beginTag('Menu.Item'),
                ...Chunk.attr('key', key, style),
                Chunk.endTag(),
                Chunk.textNode(text),
                Chunk.closeTag('Menu.Item'),
                Chunk.eol
            )
        })
        chunks.push(Chunk.closeTag('Menu'), Chunk.eol)
    }
    // import * as React from "react";
    chunks.push(
        Chunk.keyword('import'),
        Chunk.binop('*'),
        Chunk.keyword('as'),
        Chunk.name('React'),
        Chunk.keyword('from'),
        Chunk.Const(style.string('react')),
        Chunk.instrDiv
    )
    // import { Layout, Menu } from 'antd';
    const comps = [Chunk.name('Layout')]
    if (params.useMenu) comps.push(Chunk.name('Menu'))
    chunks.push(Chunk.keyword('import'))
    chunks.push(...Chunk.makeList(comps, Chunk.objBegin, Chunk.objEnd, Chunk.itemDiv, Chunk.itemDivLast))
    chunks.push(
        Chunk.keyword('from'),
        Chunk.Const(style.string('antd')),
        Chunk.instrDiv
    )
    chunks.push(Chunk.eol)
    // const { Header, Content, Footer, Sider } = Layout;
    const lcomps = [Chunk.name('Content')]
    if (params.useHeader) lcomps.push(Chunk.name('Header'))
    if (params.useSider) lcomps.push(Chunk.name('Sider'))
    if (params.useFooter) lcomps.push(Chunk.name('Footer'))
    chunks.push(Chunk.keyword('const'))
    chunks.push(...Chunk.makeList(lcomps, Chunk.objBegin, Chunk.objEnd, Chunk.itemDiv, Chunk.itemDivLast))
    chunks.push(Chunk.binop('='), Chunk.name('Layout'), Chunk.instrDiv, Chunk.eol)

    // export const MainFrame: React.FC = () => (
    chunks.push(Chunk.keyword('export'), Chunk.keyword('const'), Chunk.name('MainFrame'))
    if (isTS) chunks.push(Chunk.colon, Chunk.name('React'), Chunk.dot, Chunk.name('FC'))
    chunks.push(Chunk.binop('='), Chunk.paramsBegin, Chunk.paramsEnd, Chunk.binop('=>'), Chunk.bracketBegin, Chunk.eol)

    // <Layout className="main-layout">
    chunks.push(
        Chunk.beginTag('Layout'),
        ...Chunk.attr('className', 'main-layout', style),
        Chunk.endTag(),
        Chunk.eol
    )

    const outSider = params.useSider && params.siderPos === 'outside'
    const inSider = params.useSider && params.siderPos === 'inside'
    if (outSider) {
        chunks.push(Chunk.tag('Sider'), Chunk.eol)
        drawMenu('vert')
        chunks.push(Chunk.closeTag('Sider'), Chunk.eol)
        chunks.push(Chunk.tag('Layout'), Chunk.eol)
    }
    if (params.useHeader) {
        chunks.push(Chunk.tag('Header'), Chunk.eol)
        drawMenu('horiz')
        chunks.push(Chunk.closeTag('Header'), Chunk.eol)
    }
    if (inSider) {
        chunks.push(Chunk.tag('Layout'), Chunk.eol)
        chunks.push(Chunk.tag('Sider'), Chunk.eol)
        drawMenu('vert')
        chunks.push(Chunk.closeTag('Sider'), Chunk.eol)
    }
    chunks.push(Chunk.tag('Content'), Chunk.eol)
    chunks.push(Chunk.closeTag('Content'), Chunk.eol)
    if (inSider) {
        chunks.push(Chunk.closeTag('Layout'), Chunk.eol)
    }
    if (params.useFooter) {
        chunks.push(Chunk.tag('Footer'), Chunk.eol)
        chunks.push(Chunk.closeTag('Footer'), Chunk.eol)
    }
    if (outSider) {
        chunks.push(Chunk.closeTag('Layout'), Chunk.eol)
    }

    // </Layout>
    chunks.push(Chunk.closeTag('Layout'), Chunk.eol)
    // )
    chunks.push(Chunk.bracketEnd)

    return formatChunksEx(chunks, style)
}

module.exports = {updateStyle, makeMainFrame, updateApp}