const {logger} = require('genesis-libs')
const AffiliateTier = require('../../../../../../services/AffiliateTier')
const AffiliateTierDB = require('../../../../../../datasources/AffiliateTierDB')

module.exports = async ({entity: {affiliateId, tier}}) => {
    logger.debug('starting creating affiliate tier...')
    const service = new AffiliateTier(new AffiliateTierDB)
    await service.create(affiliateId, tier)
    logger.debug('Done')
    return 'ok'
}