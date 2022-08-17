const AffiliateStatusService = require('../../../../../../services/AffiliateStatus')
const AffiliateStatusDB = require('../../../../../../datasources/AffiliateStatusDB')
const CognitoService = require('../../../../../../services/CognitoService')

module.exports = async (event) => {
    const service = new AffiliateStatusService(new AffiliateStatusDB)
    await service.update(event.entity)
    await (new CognitoService()).deleteCognitoTokens(event.entity.affiliateId)
    return event
}