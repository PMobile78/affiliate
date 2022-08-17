const {CognitoUserPool, CognitoUserAttribute} = require('amazon-cognito-identity-js');
const {Config, SqsClient, Helpers: {floorTime}, Modules: {'node-fetch': fetch, 'aws-sdk': AWS}, logger} = require('genesis-libs')
const Password = require('../services/Password')
global.navigator = () => null
global.fetch = fetch

class CognitoService {
    async signUp(email, encryptedPassword, firstName, lastName) {
        logger.debug('starting sign up an affiliate in cognito')
        logger.debug('getting the config data')
        let cognitoUserPoolData = await Config.get('cognito')
        logger.debug('done with config, decrypting the password')
        let userPool = new CognitoUserPool(cognitoUserPoolData)
        let decryptedPassword = await (new Password()).decryptPassword(encryptedPassword)
        logger.debug('done with the password, starting signing up')
        let attributesList = []
        let username = email
        let dataEmail = {
            Name: 'email',
            Value: email
        }
        let dataGivenName = {
            Name: 'given_name',
            Value: firstName
        }
        let dataFamilyName = {
            Name: 'family_name',
            Value: lastName
        }
        let attributeEmail = new CognitoUserAttribute(dataEmail)
        let attributeGivenName = new CognitoUserAttribute(dataGivenName)
        let attributeFamilyName = new CognitoUserAttribute(dataFamilyName)

        attributesList.push(attributeEmail)
        attributesList.push(attributeGivenName)
        attributesList.push(attributeFamilyName)
        return new Promise((resolve, reject) => {
            userPool.signUp(
                username,
                decryptedPassword,
                attributesList,
                null,
                (error, result) => {
                    logger.debug('done with signing up')
                    if (error) {
                        return reject(error)
                    }

                    error ? reject(error) : resolve(result)
                }
            )
        })
    }

    async changePassword (affiliateId, email, encryptedPassword) {
        logger.debug('Start updating the password...')
        let decryptedPassword = await (new Password()).decryptPassword(encryptedPassword)
        logger.debug('password: %s', decryptedPassword)
        return this.setNewPassword(decryptedPassword, email, affiliateId)
    }

    async deleteCognitoTokens (affiliateId) {
        let sqsClient = await SqsClient.get('deleteCognitoTokens')
        try {
            let result = await sqsClient.sendSqsMessage({
                entityType: 'DeleteCognitoTokens',
                payload: {
                    affiliateId: affiliateId,
                    createdDate: floorTime(new Date)
                }
            }, 'deleteCognitoTokens')
            logger.info('Message to delete-cognito-tokens queue was added!')
            return result
        } catch (error) {
            logger.error(error)
        }
    }

    async setNewPassword (password, email, affiliateId) {
        let cognitoUserPoolData = await Config.get('cognito')
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider()
        await new Promise((resolve, reject) =>
            cognitoIdentityServiceProvider.adminSetUserPassword(
                {
                    Password: password,
                    UserPoolId: cognitoUserPoolData.UserPoolId,
                    Username: email,
                    Permanent: true
                },
                (error, data) => error ? reject(error) : resolve(data))
        )
        logger.info('Password was changed')
        return this.deleteCognitoTokens(affiliateId)
    }

    async updateEmail (oldEmail, newEmail) {
        const cognitoUserPoolData = await Config.get('cognito')
        const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider()
        return new Promise((resolve, reject) =>
            cognitoIdentityServiceProvider.adminUpdateUserAttributes(
                {
                    UserPoolId: cognitoUserPoolData.UserPoolId,
                    Username: oldEmail,
                    UserAttributes: [
                        new CognitoUserAttribute({
                            Name: 'email',
                            Value: newEmail
                        }),
                        new CognitoUserAttribute({
                            Name: 'email_verified',
                            Value: 'true'
                        })
                    ]
                },
                (error, data) => error ? reject(error) : resolve(data))
        )
    }
}

module.exports = CognitoService