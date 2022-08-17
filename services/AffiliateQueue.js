const {Config, RabbitMQClient, logger} = require('genesis-libs')

class AffiliateQueue {
    async send (data, eventType) {
        let isQueueEnabled = await Config.get('rabbitMQ.enabled')
        if (!isQueueEnabled) {
            return
        }
        try {
            await RabbitMQClient.createConnection()
            await RabbitMQClient.publishMessage({
                entityType: 'affiliate',
                eventType: eventType,
                version: 1,
                entity: data,
                triggerSource: 'RabbitMQ'
            })
        } catch (error) {
            logger.error(error)
            throw new Error('Something wrong while publishing to RabbitMQ')
        }
    }
}

module.exports = new AffiliateQueue()