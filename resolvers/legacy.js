const Legacy = require('../services/Legacy')

module.exports = {
    Query: {
        legacyAuthToken: async (_, __, {affiliateId}) => {
            const service = new Legacy()
            return service.token(affiliateId)
        }
    }
}