const Affiliate = require('../services/Affiliate')
const GenesisDB = require('../datasources/GenesisDB')
const CognitoService = require('../services/CognitoService')
const LoginService = require('../services/LoginService')
const {Exceptions: {BadInput}, Validation, logger} = require('genesis-libs')
const Password = require('../services/Password')
const Legacy = require('../services/Legacy')

class PasswordService {
    async updatePassword(oldPassword, newPassword, confirmPassword, affiliateId) {
        logger.debug('checking a new password and confirmation...')
        if (newPassword !== confirmPassword) {
            logger.debug('Oh no, not again!')
            throw new BadInput({
                newPassword: 'The new password and the confirmation is not equal'
            })
        }
        logger.debug('they are the same...')
        let validateRules = {
            newPassword: ['isNotEmpty', 'isLength:6:255'],
            confirmPassword: ['isNotEmpty', 'isLength:6:255'],
        }
        logger.debug('validating the new password...')
        Validation.validate(validateRules, {newPassword, confirmPassword})
        let objAffiliate = new Affiliate(new GenesisDB)
        logger.debug('getting an affiliate by id: %d', affiliateId)
        let affiliateData = await objAffiliate.byID(affiliateId)
        logger.debug('done: %o', affiliateData)
        let affiliateEmails = affiliateData.emails
        let affiliateEmail = {}
        affiliateEmails.forEach((item)=> {
            if (item.isActive && item.isVerified) {
                affiliateEmail = item.email
            }
        })
        logger.debug('affiliateEmail: %s', affiliateEmail)
        logger.debug('checking the old password...')
        try {
            const serviceLogin = new LoginService()
            await serviceLogin.login(affiliateEmail, oldPassword)
            logger.debug('everything is ok')
        } catch (e) {
            if (e.graphQLErrors && e.graphQLErrors.length > 0) {
                e.graphQLErrors.forEach((item) => {
                    if (item.extensions && item.extensions.code && item.extensions.code === 'UNAUTHENTICATED') {
                        logger.debug('the old password is wrong')
                        throw new BadInput({
                            oldPassword: 'The old password is wrong'
                        })
                    }
                })
                throw e
            }
            throw e
        }
        logger.debug('changing password in Cognito...')
        const cognitoService = new CognitoService()
        await cognitoService.setNewPassword(newPassword, affiliateEmail, affiliateId)
        const encryptedPassword = await (new Password()).encryptPassword(newPassword)
        const legacy = new Legacy()
        logger.debug('done, sending the password to the Legacy: %o', {
            affiliateId, encryptedPassword
        })
        await legacy.changePassword(affiliateId, encryptedPassword)
        logger.debug('done')
    }
}

module.exports = PasswordService