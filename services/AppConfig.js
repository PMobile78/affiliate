const {Exceptions: {NotFound}} = require('genesis-libs')

class AppConfig {
    constructor (database) {
        this.database = database
    }

    async create (entity) {
        return this.database.create(entity)
    }
    async update (entity) {
        return this.database.update(entity)
    }
    async getAppConfigById (affiliateId) {
        return this.database.getAppConfigById(affiliateId)
    }

    async setAppConfig (affiliateId, config) {
        try {
            const entity = await this.getAppConfigById(affiliateId)
            return await this.update({
                id: entity.id,
                affiliateId: entity.affiliate_id,
                config: config
            })
        } catch (error) {
            if (!error instanceof NotFound) {
                throw error
            }
            return await this.create({
                affiliateId: affiliateId,
                config: config
            })
        }
    }
}

module.exports = AppConfig