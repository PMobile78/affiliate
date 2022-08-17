const AffiliateTypeService = require('../../../../../../services/Affiliate')
const AffiliateTypeDB = require('../../../../../../datasources/GenesisDB')

module.exports = async (event) => {
    const service = new AffiliateTypeService(new AffiliateTypeDB)
    await service.updateType(event.entity.affiliateId, event.entity.type)
    return event
}