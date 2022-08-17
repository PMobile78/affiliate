const Affiliate = require('../../services/Affiliate')
const GenesisDB = require('../../datasources/GenesisDB')
const {logger} = require('genesis-libs')
const NotVerifiedActiveEmail = require('../../exceptions/NotVerifiedActiveEmail')
const AffiliateTagsDB = require('../../datasources/AffiliateTagsDB')
const AffiliateTags = require('../../services/AffiliateTags')
const affiliateTagsService = new AffiliateTags(new AffiliateTagsDB)

module.exports = async (event) => {
    const objAffiliate = new Affiliate(new GenesisDB)
    logger.debug('getting an affiliate by email %s', event.request.userAttributes.email)
    const affiliate = await objAffiliate.byActiveEmail(event.request.userAttributes.email)
    if (affiliate.status === 'active' && !affiliate.isActiveEmailVerified) {
        logger.debug('Affiliate have not verified email')
        throw new NotVerifiedActiveEmail()
    }
    logger.debug('the affiliate was found: %o', affiliate)
    event.response = {
        claimsOverrideDetails: {
            claimsToAddOrOverride: {
                affiliate_id: affiliate.id,
                status: await affiliateTagsService.getAffiliateVirtualStatus(affiliate.id, affiliate.status),
                createdDate: affiliate.createdDate
            }
        }
    }
    return event
}