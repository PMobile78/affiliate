const {logger} = require('genesis-libs')
const AffiliateTier = require('../../../../../../services/AffiliateTier')
const AffiliateTierDB = require('../../../../../../datasources/AffiliateTierDB')

module.exports = async ({entity: {affiliateId, tier}}) => {
    logger.debug('starting deleting affiliate tier...')
    const service = new AffiliateTier(new AffiliateTierDB)
    await service.delete(affiliateId)
    logger.debug('Done')
    return 'ok'
}