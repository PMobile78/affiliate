const Affiliate = require('./Affiliate')
const AffiliateEmail = require('./AffiliateEmails')
const GenesisDB = require('../datasources/GenesisDB')
const CognitoService = require('./CognitoService')
const {logger} = require('genesis-libs')
const {SqsClient} = require('genesis-libs')

class SignUp {
    async signUp(email, password, firstName, lastName, affiliateType = 'external', id = null) {
        const cognitoService = new CognitoService()
        const serviceAffiliate = new Affiliate(new GenesisDB)
        logger.debug('starting creating an affiliate and prepare sqs clients')
        const [affiliate, sqsClient, sqsHyunaClient, whitelist] = await Promise.all([
            serviceAffiliate.create(firstName, lastName, affiliateType, id),
            SqsClient.get('zendeskAffiliateCreate'),
            SqsClient.get('hyuna'),
            SqsClient.get('whitelist'),
            cognitoService.signUp(email, password, firstName, lastName)
        ])
        logger.debug('The affiliate was added to db. Adding the email to the affiliate...')
        const serviceEmail = new AffiliateEmail(new GenesisDB)
        await Promise.all([
            serviceEmail.create(affiliate.id, email),
            whitelist.sendSqsMessage({
                type: 'addEmail',
                message: { email }
            }),
            sqsClient.sendSqsMessage({
                type: 'newUser',
                message: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    affiliateId: affiliate.id,
                    status: 'pending'
                }
            }).catch(error => logger.error(error)),
            sqsHyunaClient.sendSqsMessage({
                entityType: 'createAffiliate',
                payload: {
                    id: affiliate.id,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    status: affiliate.status,
                    affiliateType: affiliate.type,
                    employeeId: 0,
                    paymentType: 'paypal',
                    path: 'affiliates',
                    dateAdded: ~~(Date.now() / 1000),
                    type: 'save',
                    affiliateId: affiliate.id,
                }
            }).catch(error => logger.error(error)),
        ])
        logger.debug('Done')
        return affiliate
    }
}

module.exports = SignUp