const camelcaseKeys = require('camelcase-keys')
const {Exceptions: {NotFound}, SqsClient, logger} = require('genesis-libs')

class Ratio {
    constructor (database) {
        this.database = database
    }

    async create (entity) {
        return this.database.create(entity)
    }

    async update (entity) {
        return this.database.update(entity)
    }

    async calculateConversationRatio (page = 1, perPage = 10) {
        const affiliateIds = await this.database.getAffiliateIds(page, perPage)
        if (affiliateIds.length === 0) return
        const affiliateSqs = await SqsClient.get('affiliate')
        await affiliateSqs.sendSqsMessage({
            entityType: 'calculateConversationRatio',
            payload: {
                page: ++page,
                perPage: perPage
            }
        })
        const salesSqs = await SqsClient.get('sales')
        await salesSqs.sendSqsMessage({
            entityType: 'affiliatesRatio',
            payload: {
                affiliateIds: affiliateIds.map(i => i.affiliate_id),
                interval: 'CURRENT_PERIOD'
            }
        })
    }

    async getRatioById (affiliateId) {
        return this.database.getRatioById(affiliateId)
    }

    async setRatio (affiliateId, entity) {
        logger.debug(`${affiliateId} ${entity.affiliateId}`)
        if (!affiliateId || !entity.affiliateId) return
        try {
            const savedEntity = await this.getRatioById(affiliateId)
            return await this.update({
                affiliate_id: savedEntity.affiliate_id,
                current_sales: entity.currentSales,
                previous_sales: entity.previousSales,
                current_uniq_visits: entity.currentUniqVisits,
                previous_uniq_visits: entity.previousUniqVisits,
                current_conversion_ratio: entity.currentConversionRatio,
                previous_conversion_ratio: entity.previousConversionRatio,
                comparison: entity.comparison,
            })
        } catch (error) {
            if (!error instanceof NotFound) {
                throw error
            }
            return await this.create({
                affiliate_id: affiliateId,
                current_sales: entity.currentSales,
                previous_sales: entity.previousSales,
                current_uniq_visits: entity.currentUniqVisits,
                previous_uniq_visits: entity.previousUniqVisits,
                current_conversion_ratio: entity.currentConversionRatio,
                previous_conversion_ratio: entity.previousConversionRatio,
                comparison: entity.comparison,
            })
        }
    }

    async saveData (data) {
        logger.debug('calculated ratio length: %i', data.length)
        return await Promise.all(data.map(async record => {
            await this.setRatio(record.affiliateId, record)
        }))
    }
}

module.exports = Ratio