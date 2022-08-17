const {AbstractHistory, logger, SqsClient} = require('genesis-libs')

class AffiliateStatusHistory extends AbstractHistory {
    get entityType () {
        return 'AffiliateStatusHistory'
    }

    customFieldName (oldData, newData) {
        return {
            affiliateId: oldData.affiliate_id || newData.affiliate_id
        }
    }

    get excludedFields () {
        return ['id', 'created_date', 'affiliate_id']
    }

    async log (oldData, newData) {
        const affiliateId = newData.affiliate_id || oldData.affiliate_id
        const status = newData.status || oldData.status

        const sqsClient = await SqsClient.get('zendeskAffiliateStatus')
        try {
            await sqsClient.sendSqsMessage({
                affiliateId: affiliateId,
                status: status,
            })
            logger.info('Message to zendesk affiliate status queue was added!')
        } catch (error) {
            // skip errors to apply changes in db
            logger.error(error)
        }

        await super.log(oldData, newData)
    }
}

module.exports = AffiliateStatusHistory