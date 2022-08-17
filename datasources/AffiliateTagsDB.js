const typeorm = require('typeorm')
const AffiliateTags = require('../orm/models/AffiliateTags')
const {Helpers: {floorTime}, Exceptions: {NotFound}, AbstractDB} = require('genesis-libs')

class AffiliateTagsDB extends AbstractDB {

    get typeorm () {
        return typeorm
    }

    get model () {
        return AffiliateTags
    }

    async getAffiliateTagById (affiliateId) {
        const repository = (await this.connection()).getRepository(this.model)
        return await repository.findOne(
            {
                affiliate_id: affiliateId
            },
            {
                relations: ['tags']
            }
        )
    }

    async createAffiliateTag (affiliateId, tag) {
        let connection = await this.connection()
        const record = new this.model()
        record.affiliate_id = affiliateId
        record.tag_id = tag
        record.created_date = floorTime(new Date)
        let recordRepository = connection.getRepository(this.model)
        return recordRepository.save(record)
    }

}

module.exports = AffiliateTagsDB