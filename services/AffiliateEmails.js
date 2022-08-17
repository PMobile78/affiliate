const camelcaseKeys = require('camelcase-keys')
const {Config, Helpers:{floorTime}, Exceptions: {NotFound, NotAllowed, BadInput}, logger} = require('genesis-libs')
const Affiliate = require('./Affiliate')
const Email = require('./Email')
const Token = require('./Token')
const AffiliateEmailHistoryService = require('./AffiliateEmailHistory')

class AffiliateEmails {
    constructor (database) {
        this.database = database
    }

    async create (affiliateId, email, isActive = true, fingerprint = '', sourceIp = '') {
        return camelcaseKeys(await this.database.createAffiliateEmail(affiliateId, email, isActive, fingerprint, sourceIp))
    }

    async confirm (affiliateId, tokenId, fingerprint = '', sourceIp = '') {
        return camelcaseKeys(await this.database.confirmAffiliateEmail(affiliateId, tokenId, fingerprint, sourceIp))
    }

    async sendConfirmationEmails (affiliateId, email) {
        const sendEmail = new Email()
        const createToken = new Token()
        logger.debug('creating a token...')
        const emailToken = await createToken.createEmailToken(affiliateId)
        logger.debug('done, connecting the token to the email')
        await this.database.updateToken(affiliateId, email, emailToken.tokenId)
        logger.debug('done, getting an old email...')
        const oldEmail = await this.database.getActiveEmailByID(affiliateId)
        logger.debug('done: %s', oldEmail)
        logger.debug('sending confirmation messages...')
        await sendEmail.changeEmail(oldEmail, email, emailToken.body)
        logger.debug('done')
    }

    /**
     * Warning! This method also assign the email to the affiliate if no one use it
     * @param affiliateId
     * @param email
     * @returns {Promise<*|*>}
     */
    async confirmWithoutToken (affiliateId, email) {
        try {
            return camelcaseKeys(await this.database.confirmEmailWithoutToken(affiliateId, email))
        } catch (error) {
            if (!error instanceof NotFound) {
                throw error
            }
            logger.debug('looks like this affiliate did not have this email')
        }
        logger.debug('check if someone else owns this email')
        const affiliateService = new Affiliate(this.database)
        try {
            await affiliateService.byEmail(email)
        } catch (error) {
            if (!error instanceof NotFound) {
                throw error
            }
            logger.debug('this email is new for the system - it should be registered for this affiliate')
            await this.create(affiliateId, email, false)
            return camelcaseKeys(await this.database.confirmEmailWithoutToken(affiliateId, email))
        }
        logger.debug('yep, someone use this email')
        throw new BadInput({
            email: 'already-used'
        })
    }

    async updateToken (affiliateId, email, tokenId) {
        return camelcaseKeys(await this.database.updateToken(affiliateId, email, tokenId))
    }

    async isAllowCreate(token) {
        const affiliateEmailHistoryService = new AffiliateEmailHistoryService()
        let affiliateUpdateDate = await affiliateEmailHistoryService.emailUpdatedDate(token)
        logger.debug('emailUpdateDate: %d', affiliateUpdateDate || 0)
        let {interval: deniedUpdateInterval, title: frequency} = await Config.get('deniedUpdate')
        logger.debug('deniedUpdateInterval: %d', deniedUpdateInterval)
        let time = floorTime(new Date)
        if (affiliateUpdateDate && (time - affiliateUpdateDate) < deniedUpdateInterval) {
            throw new NotAllowed('email', {frequency})
        }
    }

    async changeEmail (affiliateId, oldEmail, newEmail) {
        return camelcaseKeys(await this.database.changeEmail(affiliateId, oldEmail, newEmail))
    }
}

module.exports = AffiliateEmails