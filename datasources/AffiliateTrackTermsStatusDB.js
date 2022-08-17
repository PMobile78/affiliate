const typeorm = require('typeorm')
const AffiliateTrackTerms = require('../orm/models/AffiliateTrackTerms')
const {Helpers: {floorTime}, Exceptions: {NotFound}, AbstractDB} = require('genesis-libs')

class AffiliateTrackTermsStatusDB extends AbstractDB {

    get typeorm () {
        return typeorm
    }

    get model () {
        return AffiliateTrackTerms
    }

    async create (entity) {
        let connection = await this.connection()
        const record = new AffiliateTrackTerms()
        record.affiliate_id = entity.affiliateId
        record.status = entity.status
        record.created_date = entity.createdDate ? entity.createdDate : floorTime(new Date)
        let recordRepository = connection.getRepository(AffiliateTrackTerms)
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

module.exports = AffiliateTrackTermsStatusDB