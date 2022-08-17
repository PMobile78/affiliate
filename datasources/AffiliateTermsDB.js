const typeorm = require('typeorm')
const AffiliateTerms = require('../orm/models/AffiliateTerms')
const {Helpers: {floorTime}, Exceptions: {NotFound}, AbstractDB} = require('genesis-libs')

class AffiliateTermsDB extends AbstractDB {

    get typeorm () {
        return typeorm
    }

    get model () {
        return AffiliateTerms
    }

    async create (entity) {
        let connection = await this.connection()
        const record = new AffiliateTerms()
        record.affiliate_id = entity.affiliateId
        record.status = entity.status
        record.version = entity.version
        record.created_date = entity.createdDate ? entity.createdDate : floorTime(new Date)
        let recordRepository = connection.getRepository(AffiliateTerms)
        return recordRepository.save(record)
    }

    async update (entity) {
        const repository = (await this.connection()).getRepository(this.model)
        const record = await repository.findOne({
            affiliate_id : entity.affiliateId,
            version: entity.version
        })
        if (!record) {
            throw new NotFound('affiliate', entity.affiliateId)
        }
        record.status = entity.status
        record.version = entity.version
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

module.exports = AffiliateTermsDB