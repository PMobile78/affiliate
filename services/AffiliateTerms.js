const {Config, Exceptions: {NotFound}, logger} = require('genesis-libs')
const RabbitMQ = require('../services/RabbitMQ')
const camelcaseKeys = require('camelcase-keys')

class AffiliateTerms {
    constructor (database) {
        this.database = database
    }

    async createOrUpdate(entity) {
        entity.version = await Config.get('terms.version')
        entity.id = null
        try {
            return camelcaseKeys(await this.database.update(entity))
        } catch (e) {
            if (e instanceof NotFound) {
                return camelcaseKeys(await this.database.create(entity))
            } else {
                throw e
            }
        }
    }

    async sendToRabbit(data) {
        const sendDataToRabbitMQ = new RabbitMQ()
        logger.debug('Sending affiliate terms changed data to the Legacy...')
        await sendDataToRabbitMQ.sendTerms(data)
    }

    async byID (affiliateId) {
        return this.database.getStatusById(affiliateId)
    }

}

module.exports = AffiliateTerms
