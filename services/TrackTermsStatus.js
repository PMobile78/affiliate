const {Exceptions: {NotFound}} = require('genesis-libs')

class TrackTermsStatus {
    constructor (database) {
        this.database = database
    }

    async createOrUpdate(entity) {
        try {
            await this.database.update(entity)
        } catch (e) {
            if (e instanceof NotFound) {
                await this.database.create(entity)
            } else {
                throw e
            }
        }
    }

    async byID (affiliateId) {
        return this.database.getStatusById(affiliateId)
    }

}

module.exports = TrackTermsStatus