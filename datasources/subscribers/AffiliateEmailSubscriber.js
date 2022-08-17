const {EventSubscriber} = require('typeorm')
const AffiliateEmail = require('../../orm/models/AffiliateEmail')
const AffiliateEmailHistory = require('../../services/AffiliateEmailHistory')
const {AbstractSubscriber} = require('genesis-libs')

class AffiliateEmailSubscriber extends AbstractSubscriber {
    listenTo () {
        return AffiliateEmail
    }

    getService () {
        if (this.service === null) {
            this.service = new AffiliateEmailHistory()
        }
        return this.service
    }
}

module.exports = AbstractSubscriber.decorateClass(EventSubscriber(/* Decorator params */), AffiliateEmailSubscriber)