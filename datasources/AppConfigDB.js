const typeorm = require('typeorm')
const AppConfig = require('../orm/models/AppConfig')
const {Exceptions: {NotFound}, AbstractDB} = require('genesis-libs')

class AppConfigDB extends AbstractDB {

    get typeorm () {
        return typeorm
    }

    get model () {
        return AppConfig
    }

    async create (entity) {
        let connection = await this.connection()
        const record = new AppConfig()
        record.affiliate_id = entity.affiliateId,
        record.config = entity.config
        let recordRepository = connection.getRepository(AppConfig)
        return recordRepository.save(record)
    }

    async update (entity) {
        const repository = (await this.connection()).getRepository(this.model)
        const record = await repository.findOne({
            affiliate_id : entity.affiliateId
        })
        if (!record) {
            throw new NotFound('appConfig', entity.affiliateId)
        }
        record.config = entity.config
        return repository.save(record)
    }

    async getAppConfigById (affiliateId) {
        const repository = (await this.connection()).getRepository(this.model)
        const record = await repository.findOne({
            affiliate_id : affiliateId
        })
        if (!record) {
            return {config: null}
        }
        return record
    }
}

module.exports = AppConfigDB
