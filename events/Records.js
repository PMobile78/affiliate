const {logger} = require('genesis-libs')
const Hyuna = require('../services/Hyuna')
const AffiliateStatus = require('../services/AffiliateStatus')
const AffiliateTags = require('../services/AffiliateTags')
const OmnichannelLastComment = require('../services/OmnichannelLastComment')
const Ratio = require('../services/Ratio')
const OmnichannelLastCommentDB = require('../datasources/OmnichannelLastCommentDB')
const AffiliateStatusDB = require('../datasources/AffiliateStatusDB')
const AffiliateTagsDB = require('../datasources/AffiliateTagsDB')
const TagsDB = require('../datasources/TagsDB')
const CognitoService = require('../services/CognitoService')
const RatioDB = require('../datasources/RatioDB')

module.exports = async (event, context) => {
    return await Promise.all(event.Records.map(async record => {
        let body = JSON.parse(record.body)
        if (body.entityType === 'updateAffiliate' || body.entityType === 'createAffiliate') {
            let data = body.payload
            let serviceHyuna = new Hyuna()
            return await serviceHyuna.callHyunaAPI(data.path, data, data.type, data.id)
        }
        if (body.entityType === 'lastComment' && body.eventType === 'create') {
            logger.debug('Got lastComment event')
            const data = body.entity
            const service = new OmnichannelLastComment(new OmnichannelLastCommentDB)
            return await service.createOrUpdate(data.affiliateId, data.ticketId, data.authorRole, data.authorEmail)
        }
        if (body.entityType === 'updateStatus') {
            let data = body.entity
            const serviceAffiliateStatus = new AffiliateStatus(new AffiliateStatusDB)
            if (data.status === 'duplicated') {
                let tagDB = new TagsDB()
                let tag = await tagDB.getTagByName('duplicated')
                const serviceAffiliateTags = new AffiliateTags(new AffiliateTagsDB)
                await serviceAffiliateTags.createAffiliateTag(data.affiliateId, tag.id)
                return
            }
            await serviceAffiliateStatus.update(data)
            await (new CognitoService()).deleteCognitoTokens(data.affiliateId)
        }
        if (body.entityType === 'calculateConversationRatio') {
            logger.debug('Got calculateConversationRatio event')
            const data = body.payload
            const page = data.page ? data.page : 1
            const perPage = data.perPage ? data.perPage : 10
            const service = new Ratio(new RatioDB())
            return await service.calculateConversationRatio(page, perPage)
        }
        if (body.entityType === 'conversionRatio') {
            logger.debug('Got conversionRatio event')
            const data = body.payload
            const service = new Ratio(new RatioDB())
            return await service.saveData(data)
        }
    }))
}