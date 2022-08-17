const {Exceptions:{NotFound}} = require('genesis-libs')

class AffiliateTier {
    constructor (database) {
        this.database = database
    }

    async create (affiliateId, tier) {
        return await this.database.create(affiliateId, tier)
    }

    async update (affiliateId, tier) {
        return await this.database.update(affiliateId, tier)
    }

    async delete (affiliateId) {
        return await this.database.delete(affiliateId)
    }
}

module.exports = AffiliateTier