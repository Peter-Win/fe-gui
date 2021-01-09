/**
 * Добавление новой сущности в приложение.
 *
 * Список доступных сущностей можно собрать, используя флаг isReady
 * Клиент запрашивает список через readyEntitiesAsk
 * Сервер шлет список через readyEntities([])
 *
 * При клике на элемент списка клиент отправляет startUpgrade(entityName)
 * Сервер устанавливает режим upgrade и отправляет html-код через upgradePrompt
 * Код включает форму и описание
 * Если есть дополнительные параметры, то для них код формы читается из файла /client/entities/NAME.templ.html
 * Если для формы нужен код контроллеров, то можно прямо в шаблоне сделать <script/>
 *
 * Сабмит формы вызывает upgradeEntity({name, params})
 * Сервер устанавливает режим create, шлет сообщения о прогрессе установски через createEntity*
 * В отличие от создания приложения, здесь в конце выводится кнопка Continue
 * confirmSuccessUpgrade - клиент шлет при нажатии на кнопку Continue
 * Сервер переключается в режим ready и шлет обновленную инфу
 */
const { wsSend } = require('../wsServer')
const { CommonInfo } = require('../CommonInfo')
const { loadTemplate } = require('../sysUtils/loadTemplate')
const { createEntity, updateEntitiesState } = require('./createEntity')

module.exports.upgradeApp = async (name) => {
    CommonInfo.upgradeTarget = name
    CommonInfo.send()
    CommonInfo.setGlobalStatus(CommonInfo.glbStUpgrade)
}

module.exports.sendUpgradeInfo = async () => {
    const { entities } = require('../entity/all')
    const name = CommonInfo.upgradeTarget
    const entity = entities[name]
    const tparams = {
        description: entity.description || '',
        controls: entity.controls || '',
    }
    const data = {
        name,
        html: await loadTemplate('upgradeForm.html', tparams),
        params: entity.defaultParams || {},
    }
    wsSend('upgradePrompt', data)
}

module.exports.onUpgrade = async (name, params) => {
    const { entities } = require('../entity/all')
    /*
    try {
        if (!(name in entities)) throw new Error(`Invalid entity: ${name}`)
        const entity = entities[name]
        wsSend('createEntityBegin', name)
        await entity.create(params)
        wsSend('createEntityEnd', {name, status: 'Ok'})
        await entity.init()
        await doPostFx(name, entities)
        wsSend('createEntityMsg', {message: 'SUCCESS FINISH', type: 'success'})
    } catch (e) {
        console.error(e)
        wsSend('createEntityEnd', {name, status: 'Error', message: e.message})
    }
    */
    try {
        const ok = await createEntity(entities, name, params)
        if (ok) {
            await updateEntitiesState(entities)
            wsSend('createEntityMsg', { message: 'SUCCESS FINISH', type: 'success' })
        }
    } catch (e) {
        wsSend('createEntityMsg', { name, message: e.message, type: 'err' })
    }
    wsSend('onCreateEnd')
}
