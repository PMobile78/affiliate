const {RabbitMQClient} = require('genesis-libs')
const {Config, logger} = require('genesis-libs')

class RabbitMQ {
    async send (data) {
        const message = {
            entityType: 'affiliate',
            eventType: 'confirmEmail',
            version: 1,
            entity: {
                affiliateId: data.id,
                email: data.email
            },
            triggerSource: 'RabbitMQ'
        }

        try {
            await RabbitMQClient.createConnection()
            await RabbitMQClient.publishMessage(message)
        } catch (error) {
            logger.debug('RabbitMQ send: %d', error)
            throw new Error('Something wrong while publishing to RabbitMQ an Affiliate data for create!')
        }
    }

    async sendTerms (data) {
        let eventType = (data.status === 'accepted') ? 'accept' : 'refuse'
        const message = {
            entityType: 'terms',
            eventType: eventType,
            version: 1,
            entity: {
                affiliateId: data.affiliateId,
                createdDate: data.createdDate
            },
            triggerSource: 'RabbitMQ'
        }
        try {
            let client = await RabbitMQClient.createConnection()
            let rabbitMQConfig = await Config.get('rabbitMQ.terms')
            client.params.exchangeName = rabbitMQConfig.exchangeName
            client.params.routingKey = rabbitMQConfig.routingKey
            await RabbitMQClient.publishMessage(message)
        } catch (error) {
            logger.debug('RabbitMQ send: %d', error)
            throw new Error('Something wrong while publishing to RabbitMQ an Affiliate terms data!')
        }
    }
}

module.exports = RabbitMQ