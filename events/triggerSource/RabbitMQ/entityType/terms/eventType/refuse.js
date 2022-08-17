const {logger} = require('genesis-libs')
const AffiliateTerms = require('../../../../../../services/AffiliateTerms')
const AffiliateTermsDB = require('../../../../../../datasources/AffiliateTermsDB')

module.exports = async ({entity: {affiliateId, createdDate}}) => {
    logger.debug('starting changing affiliate terms...')
    const service = new AffiliateTerms(new AffiliateTermsDB)
    await service.createOrUpdate({affiliateId, status: 'refused'})
    logger.debug('Done')
    return 'ok'
}