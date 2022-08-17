const OmnichannelLastComment = require('../orm/models/OmnichannelLastComment')
const {Helpers: {floorTime}, AbstractDB} = require('genesis-libs')
const typeorm = require('typeorm')
const {Not} = require('typeorm')

class OmnichannelLastCommentDB extends AbstractDB {
    get typeorm () {
        return typeorm
    }

    get model () {
        return OmnichannelLastComment
    }

    async createOrUpdate (affiliateId, ticketId, authorRole, authorId) {
        const repository = (await this.connection()).getRepository(this.model)
        let rules = {
            affiliate_id: affiliateId,
            author_role: 'end-user'
        }
        authorRole = authorRole.toLowerCase()
        if (authorRole !== 'end-user') {
            rules.author_role = Not('end-user')
        }
        let record = await repository.findOne(rules)
        if (!record) {
            record = new OmnichannelLastComment()
        }
        record.affiliate_id = affiliateId
        record.ticket_id = ticketId
        record.author_role = authorRole
        record.author_id = authorId
        record.updated_date = floorTime(new Date)
        return repository.save(record)
    }

    async lastByIds (affiliateIds, additionalParams = null) {
        if (!affiliateIds || !affiliateIds.length) {
            return []
        }
        let order = {}
        let connection = await this.connection()
        let query = connection.createQueryBuilder(this.model, 'message')
            .select('message.affiliate_id', 'affiliate_id')
            .addSelect('MAX(message.updated_date)', 'updated_date')
            .where('message.affiliate_id IN (:...affiliateIds)', {affiliateIds:affiliateIds})
            .groupBy('message.affiliate_id')
        if (additionalParams && additionalParams.sort && additionalParams.sort.length) {
            additionalParams.sort.forEach((item) => {
                if (item.field === 'lastContactDate') {
                    order['message.updated_date'] = item.type
                    query.orderBy(order)
                }
            })
        }
        if (additionalParams && additionalParams.perPage && additionalParams.pageNumber) {
            let page = (additionalParams.pageNumber == 0 ) ? 0 : additionalParams.pageNumber - 1
            query.skip(additionalParams.perPage * page)
            query.take(additionalParams.perPage)
        }

        return await query.getRawMany()
    }
}

module.exports = OmnichannelLastCommentDB
