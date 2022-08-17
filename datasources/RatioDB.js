const AffiliateRatio = require('../orm/models/AffiliateRatio')
const AffiliateStatus = require('../orm/models/AffiliateStatus')
const {AbstractDB, Exceptions: {NotFound}, logger} = require('genesis-libs')
const typeorm = require('typeorm')
class RatioDB extends AbstractDB {

    get typeorm () {
        return typeorm
    }
    async create (entity) {
        let connection = await this.connection()
        const record = new AffiliateRatio()
        record.affiliate_id = entity.affiliate_id
        record.current_sales = entity.current_sales
        record.previous_sales = entity.previous_sales
        record.current_uniq_visits = entity.current_uniq_visits
        record.previous_uniq_visits = entity.previous_uniq_visits
        record.current_conversion_ratio = entity.current_conversion_ratio
        record.previous_conversion_ratio = entity.previous_conversion_ratio
        record.comparison = entity.comparison
        let recordRepository = connection.getRepository(AffiliateRatio)
        return recordRepository.save(record)
    }

    async update (entity) {
        const repository = (await this.connection()).getRepository(this.model)
        const record = await repository.findOne({
            affiliate_id : entity.affiliate_id
        })
        if (!record) {
            throw new NotFound('affiliateRatio', entity.affiliate_id)
        }
        record.current_sales = entity.current_sales
        record.previous_sales = entity.previous_sales
        record.current_uniq_visits = entity.current_uniq_visits
        record.previous_uniq_visits = entity.previous_uniq_visits
        record.current_conversion_ratio = entity.current_conversion_ratio
        record.previous_conversion_ratio = entity.previous_conversion_ratio
        record.comparison = entity.comparison
        return repository.save(record)
    }

    async getAffiliateIds (page = 1, perPage = 10, status = 'active') {
        let queryPage = (page === 0) ? 0 : page - 1
        let connection = await this.connection()
        let query = connection.createQueryBuilder(AffiliateStatus, 'affiliate_status')
            .select('affiliate_status.affiliate_id', 'affiliate_id')
            .where('affiliate_status.status = :status', {status: status})
            .offset(perPage * queryPage)
            .limit(perPage)
        const sql = query.getSql()
        logger.debug(sql)
        return await query.getRawMany()
    }

    async getRatioById (affiliateId) {
        const repository = (await this.connection()).getRepository(this.model)
        const record = await repository.findOne({
            affiliate_id : affiliateId
        })
        return record
    }

}

module.exports = RatioDB
