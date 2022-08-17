const Manager = require('./Manager')
const camelcaseKeys = require('camelcase-keys')
const {logger} = require('genesis-libs')

class OmnichannelLastComment {
    constructor (database) {
        this.database = database
    }

    async createOrUpdate (affiliateId, ticketId, authorRole, authorEmail) {
        let authorId = affiliateId
        if (authorRole !== 'End-user') {
            logger.debug('Author role not End-user')
            const managerService = new Manager()
            let manager = await managerService.managerByEmail(authorEmail)
            authorId = manager.id
            logger.debug('manager id: %d', authorId)
        }
        return this.database.createOrUpdate(affiliateId, ticketId, authorRole, authorId)
    }

    async lastByIds (affiliateIds, additionalParams = null) {
        return camelcaseKeys( await this.database.lastByIds(affiliateIds, additionalParams))
    }

}

module.exports = OmnichannelLastComment