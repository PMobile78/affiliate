const typeorm = require('typeorm')
const AffiliateStatus = require('../orm/models/AffiliateStatus')
const {Helpers: {floorTime}, Exceptions: {NotFound}, AbstractDB} = require('genesis-libs')

class AffiliateStatusDB extends AbstractDB {

    get typeorm () {
        return typeorm
    }

    get model () {
        return AffiliateStatus
    }

    async create (entity) {
        let connection = await this.connection()
        const record = new AffiliateStatus()
        record.affiliate_id = entity.affiliateId
        record.status = entity.status
        record.created_date = entity.createdDate ? entity.createdDate : floorTime(new Date)
        let recordRepository = connection.getRepository(AffiliateStatus)
        return recordRepository.save(record)
    }

    async update (entity) {
        const repository = (await this.connection()).getRepository(this.model)
        const record = await repository.findOne({
            affiliate_id : entity.affiliateId
        })
        if (!record) {
            throw new NotFound('affiliate', entity.affiliateId)
        }
        record.status = entity.status
        return repository.save(record)
    }

    async getStatusById (affiliateId) {
        const repository = (await this.connection()).getRepository(this.model)
        const record = await repository.findOne({
            affiliate_id : affiliateId
        })
        if (!record) {
            throw new NotFound('affiliate', affiliateId)
        }
        return record.status
    }
}

module.exports = AffiliateStatusDB
