const {EventSubscriber} = require('typeorm')
const Affiliate = require('../../orm/models/Affiliate')
const AffiliateHistory = require('../../services/AffiliateHistory')
const {AbstractSubscriber} = require('genesis-libs')
const AffiliateQueue = require('../../services/AffiliateQueue')

class AffiliateSubscriber extends AbstractSubscriber {
    listenTo () {
        return Affiliate
    }

    getService () {
        if (this.service === null) {
            this.service = new AffiliateHistory()
        }
        return this.service
    }

    async afterUpdate (data) {
        if (!data.entity && !data.databaseEntity) { // skip any queries where no results
            return
        }
        await super.afterUpdate(data)
        await AffiliateQueue.send({
            id: data.entity.id,
            firstName: data.entity.first_name,
            lastName: data.entity.last_name
        }, 'update')
    }
}

module.exports = AbstractSubscriber.decorateClass(EventSubscriber(/* Decorator params */), AffiliateSubscriber)