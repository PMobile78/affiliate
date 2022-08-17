const {EventSubscriber} = require('typeorm')
const Service = require('../../services/AffiliateStatusHistory')
const {AbstractSubscriber} = require('genesis-libs')
const Model = require('../../orm/models/AffiliateStatus')

class AffiliateStatus extends AbstractSubscriber {
    get tableName () {
        return 'affiliate_status'
    }

    listenTo () {
        return Model
    }

    getService () {
        if (this.service === null) {
            this.service = new Service(this.tableName)
        }
        return this.service
    }
}

module.exports = AffiliateStatus.decorateClass(EventSubscriber(/* Decorator params */), AffiliateStatus)