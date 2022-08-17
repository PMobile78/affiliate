const {Config} = require('genesis-libs')
const jwt = require('jsonwebtoken')
const {v4: uuidv4} = require('uuid')
const Affiliate = require('./Affiliate')
const GenesisDB = require('../datasources/GenesisDB')

class Zendesk {

    async createZendeskToken (affiliateId) {
        let {key, enabled} = await Config.get('zendesk')
        if (!enabled) {
            return false
        }
        let serviceAffiliate = new Affiliate(new GenesisDB)
        let affiliate = await serviceAffiliate.byID(affiliateId)
        let affiliateName = `${affiliate.firstName} ${affiliate.lastName}`
        let email = affiliate.emails[0].email
        const token = jwt.sign(
            {
                jti: uuidv4(),
                iat: Math.floor(Date.now() / 1000),
                email: email,
                name: affiliateName
            },
            key,
            {
                algorithm: 'HS256'
            }
        )
        return {
            token: token
        }
    }
}

module.exports = Zendesk
