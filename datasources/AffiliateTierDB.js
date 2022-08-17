const typeorm = require('typeorm')
const AffiliateTier = require('../orm/models/AffiliateTier')
const {Helpers: {floorTime}, Exceptions: {NotFound}, AbstractDB} = require('genesis-libs')

class AffiliateTierDB extends AbstractDB {

    get typeorm () {
        return typeorm
    }

    get model () {
        return AffiliateTier
    }

    async byAffiliateId (affiliateId) {
        const repository = (await this.connection()).getRepository(this.model)
        const record = await repository.findOne({
            affiliate_id : affiliateId
        })
        if (!record) {
            throw new NotFound('affiliateTier', affiliateId)
        }
        return record
    }

    async update (affiliateId, tier) {
        const repository = (await this.connection()).getRepository(this.model)
        const record = await this.byAffiliateId(affiliateId)
        record.tier = tier
        return repository.save(record)
    }

    async create (affiliateId, tier) {
        let connection = await this.connection()
        const record = new AffiliateTier()
        record.affiliate_id = affiliateId
        record.tier = tier
        record.created_date = floorTime(new Date)
        let recordRepository = connection.getRepository(AffiliateTier)
        return recordRepository.save(record)
    }

    async delete (affiliateId) {
        let connection = await this.connection()
        let sectionRepository = connection.getRepository(AffiliateTier)
        let record = await this.byAffiliateId(affiliateId)
        await sectionRepository.delete(record.id)
    }

}

module.exports = AffiliateTierDB
