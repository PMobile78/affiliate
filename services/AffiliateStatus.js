class AffiliateStatus {
    constructor (database) {
        this.database = database
    }

    async create (entity) {
        return this.database.create(entity)
    }
    async update (entity) {
        return this.database.update(entity)
    }
    async byID (affiliateId) {
        return this.database.getStatusById(affiliateId)
    }

}

module.exports = AffiliateStatus