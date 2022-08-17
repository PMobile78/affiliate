const AffiliateEmail = require('../../../../../../services/AffiliateEmails')
const GenesisDB = require('../../../../../../datasources/GenesisDB')
const {logger, SqsClient} = require('genesis-libs')

module.exports = async ({entity: {affiliateId, email}}) => {
    logger.debug('starting email verification...')
    const serviceEmail = new AffiliateEmail(new GenesisDB)
    await serviceEmail.confirmWithoutToken(affiliateId, email)
    logger.debug('email was confirmed. Saving the email in white list...')
    const whitelist = await SqsClient.get('whitelist')
    await whitelist.sendSqsMessage({
        type: 'addEmail',
        message: { email }
    })
    logger.debug('Done')
    return email
}
