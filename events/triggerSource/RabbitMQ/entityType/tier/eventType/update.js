const {logger} = require('genesis-libs')
const AffiliateTier = require('../../../../../../services/AffiliateTier')
const AffiliateTierDB = require('../../../../../../datasources/AffiliateTierDB')

module.exports = async ({entity: {affiliateId, tier}}) => {
    logger.debug('starting changing affiliate tier...')
    const service = new AffiliateTier(new AffiliateTierDB)
    await service.update(affiliateId, tier)
    logger.debug('Done')
    return 'ok'
}