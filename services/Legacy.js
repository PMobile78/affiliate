const Rijndael = require('rijndael-js')
const {Config, RabbitMQClient, logger} = require('genesis-libs')

class Legacy {
    async token (affiliateId) {
        const key = await Config.get('api.legacy.key')
        const cipher = new Rijndael(key, 'ecb')
        const timestamp = Date.now() / 1000
        return encodeURIComponent(Buffer.from(cipher.encrypt(JSON.stringify({ affiliateId, timestamp }), 256)).toString('base64'))
    }

    async changePassword (affiliateId, encryptedPassword) {
        let isQueueEnabled = await Config.get('rabbitMQ.enabled')
        if (!isQueueEnabled) {
            return
        }
        let entity = {
            affiliateId: affiliateId,
            password: encryptedPassword,
        }
        let message = {
            entityType: 'affiliate',
            eventType: 'changePassword',
            version: 1,
            entity: entity,
            triggerSource: 'RabbitMQ'
        }
        try {
            await RabbitMQClient.createConnection()
            await RabbitMQClient.publishMessage(message)
        } catch (error) {
            logger.error(error)
            throw new Error('Something wrong while publishing to RabbitMQ an Affiliate password for changing!')
        }
    }
}

module.exports = Legacy