const Affiliate = require('../../../../../../services/Affiliate')
const GenesisDB = require('../../../../../../datasources/GenesisDB')
const CognitoService = require('../../../../../../services/CognitoService')
const AffiliateEmail = require('../../../../../../services/AffiliateEmails')
const {logger, Exceptions:{NotFound}} = require('genesis-libs')

module.exports = async ({entity: {id, email: newEmail}}) => {
    logger.debug('starting changing email...')
    logger.debug('looking for the current active email...')
    const db = new GenesisDB()
    const affiliateService = new Affiliate(db)
    const affiliate = await affiliateService.byID(id)
    const currentEmail = affiliate.emails.find(email => email.isActive)
    if (!currentEmail) {
        throw new Error('There is no active email for the affiliate ' + id)
    }
    const inactiveEmail = affiliate.emails.find(email => email.email === newEmail)
    if (!inactiveEmail) {
        throw new NotFound('affiliate', newEmail)
    }
    logger.debug('found, let\'s update the email in AWS Cognito')
    const cognito = new CognitoService()
    await cognito.updateEmail(currentEmail.email, newEmail)
    const affiliateEmailService = new AffiliateEmail(db)
    await affiliateEmailService.changeEmail(id, currentEmail.email, newEmail)
    logger.debug('Done')
    return 'ok'
}