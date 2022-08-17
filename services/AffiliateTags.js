const camelcaseKeys = require('camelcase-keys')

class AffiliateTags {
    constructor (database) {
        this.database = database
    }

    async getAffiliateTagById (affiliateId) {
        return camelcaseKeys(await this.database.getAffiliateTagById(affiliateId))
    }

    async createAffiliateTag (affiliateId, tag) {
        return camelcaseKeys(await this.database.createAffiliateTag(affiliateId, tag))
    }

    async getAffiliateVirtualStatus (affiliateId, status) {
        let virtualStatus = status
        // Temporary off
        // let affiliateTag = await this.getAffiliateTagById(affiliateId)
        // if (typeof affiliateTag !== 'undefined' && affiliateTag.tags.name === 'duplicated') {
        //     virtualStatus = 'duplicated'
        // }
        return virtualStatus
    }
}

module.exports = AffiliateTags
