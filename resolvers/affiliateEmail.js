const AffiliateEmail = require('../services/AffiliateEmails')
const GenesisDB = require('../datasources/GenesisDB')
const Cognito = require('../services/CognitoService')
const Affiliate = require('../services/Affiliate')
const RabbitMQ = require('../services/RabbitMQ')
const {Exceptions:{NotFound, BadInput}, logger, Validation, SqsClient} = require('genesis-libs')

module.exports = {
    Mutation: {
        confirmAffiliateEmail: async (parent, {affiliateId, tokenId}) => {
            let objAffiliateEmail = new AffiliateEmail(new GenesisDB)
            return objAffiliateEmail.confirm(affiliateId, tokenId)
        },
        updateAffiliateEmailTokenSecret: async (parent, {affiliateId, email, tokenId}) => {
            let objAffiliateEmail = new AffiliateEmail(new GenesisDB)
            return objAffiliateEmail.updateToken(affiliateId, email, tokenId)
        },
        applyNewEmail: async (parent, {affiliateId, tokenId, fingerprint, sourceIp}) => {
            const db = new GenesisDB()
            const affiliateService = new Affiliate(db)
            logger.debug('getting the affiliate\'s emails...')
            const affiliate = await affiliateService.byID(affiliateId)
            logger.debug('affiliate %o', affiliate)
            logger.debug('token %s', tokenId)
            const oldEmail = affiliate.emails.find(email => email.isActive)
            const newEmail = affiliate.emails.find(email => email.tokenId === tokenId)
            if (!oldEmail) {
                logger.debug('there is no the old email: %o', affiliate.emails)
                throw new Error('Something wrong with the old email')
            }
            if (!newEmail) {
                logger.debug('there is no the new email: %o, tokenId %s', affiliate.emails, tokenId)
                throw new BadInput({
                    token: 'Token was expired'
                })
            }
            let anotherAffiliate = null
            try {
                anotherAffiliate = await affiliateService.byActiveEmail(newEmail.email)
            } catch (error) {
                if (!error instanceof NotFound) {
                    throw error
                }
            }
            if (anotherAffiliate) {
                logger.debug('this email is already used by another affiliate: %d', anotherAffiliate.id)
                throw new BadInput({email: 'already-used'})
            }
            const cognito = new Cognito()
            logger.debug('updating the email in AWS Cognito...')
            await cognito.updateEmail(oldEmail.email, newEmail.email)
            logger.debug('done, updating in db...')
            const objAffiliateEmail = new AffiliateEmail(db)
            const result = await objAffiliateEmail.confirm(affiliateId, tokenId, fingerprint, sourceIp)
            let employeeId = await affiliateService.getEmployeeId(affiliate.id)
            let paymentMethod = await affiliateService.getPaymentMethod(affiliate.id)
            const sqsClient = await SqsClient.get('hyuna')
            try {
                await sqsClient.sendSqsMessage({
                    'entityType': 'updateAffiliate',
                    'payload': {
                        'id': affiliate.id,
                        'firstName': affiliate.firstName,
                        'lastName': affiliate.lastName,
                        'email': newEmail.email,
                        'status': affiliate.status,
                        'affiliateType': affiliate.type,
                        'employeeId': employeeId,
                        'paymentType': paymentMethod,
                        'path': 'affiliates',
                        'dateAdded': ~~(Date.now() / 1000),
                        'type': 'update',
                        'affiliateId': affiliate.id,
                    }
                })
                logger.info('Message to `hyuna` queue was added!')
            } catch (error) {
                // skip errors to apply changes in db
                logger.error(error)
            }
            const sendDataToRabbitMQ = new RabbitMQ()
            logger.debug('done,sending a message to the Legacy...')
            await sendDataToRabbitMQ.send({id: affiliate.id, email: newEmail.email})
            logger.debug('done')
            return result
        },
        createAffiliateEmail: async (parent, {email, fingerprint}, {affiliateId, sourceIp, token}) => {
            logger.debug('validating affiliate\'s email...')
            Validation.validate({email: ['isEmail']}, {email})
            logger.debug('creating affiliate\'s email...')
            const db = new GenesisDB()
            const affiliateEmail = new AffiliateEmail(db)
            logger.debug('checking if creating is allowed...')
            await affiliateEmail.isAllowCreate(token)
            logger.debug('ok, checking if this email already added')
            let result = null
            const affiliateService = new Affiliate(db)

            //checking if this email already used
            try {
                const affiliate = await affiliateService.byActiveEmail(email)
                result = affiliate.emails.find(record => record.email.toLowerCase() === email.toLowerCase())

                if (affiliate.status !== 'deleted') {
                    logger.debug('Email is already active')
                    if (result.affiliateId == affiliateId) {
                        throw new BadInput({email: 'This email is already active'})
                    }
                    throw new BadInput({email: 'already-used'})
                }
            } catch (e) {
                if (!(e instanceof NotFound)) {
                    throw e
                }
            }

            //checking if this email already added for this affiliate
            const affiliate = await affiliateService.byID(affiliateId)
            result = affiliate.emails.find(record => record.email.toLowerCase() === email.toLowerCase())

            if (result) {
                logger.debug('skipped inserting, it\'s already in db')
            } else {
                logger.debug('creating is allowed, trying to insert a new email in db...')
                result = await affiliateEmail.create(affiliateId, email, false, fingerprint, sourceIp)
            }
            logger.debug('done, sending confirmation messages...')
            await affiliateEmail.sendConfirmationEmails(affiliateId, email)
            return result
        }
    },
}
