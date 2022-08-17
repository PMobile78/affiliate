const Zendesk = require('../services/Zendesk')

module.exports = {
    Query: {
        zendeskToken: async (parent, params, {affiliateId}) => {
            let serviceZendesk = new Zendesk()
            return serviceZendesk.createZendeskToken(affiliateId)
        }
    }
}
