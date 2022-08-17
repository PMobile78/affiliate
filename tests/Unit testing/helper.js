const GenesisDBTest = require('../genesisDBTest')
const Affiliates = require('../../orm/models/Affiliate')
const AffiliateEmails = require('../../orm/models/AffiliateEmail')
const {floorTime} = require('../../utils')

class Helper {
    constructor () {

    }

    async getInitialParams () {
        let affiliate = {
            id: 2,
            password: '12345',
            first_name: 'FirstName',
            last_name: 'LastName',
            created_date: 1568630125
        }
        let emails = [
            {
                id: 1,
                affiliate_id: affiliate.id,
                token_id: 0,
                email: 'test1@test.com',
                is_verified: true,
                is_active: true,
                created_date: 1568630125
            }
        ]
        affiliate.affiliateEmails = emails

        let updateAffiliateParams = {
            password: '12345',
            firstName: 'FirstName',
            lastName: 'LastName'
        }

        class Datasource {
        }

        Datasource.prototype.getAffiliateByID = jest.fn().mockReturnValue(affiliate)
        Datasource.prototype.getAffiliateByEmail = jest.fn().mockReturnValue(emails[0])
        Datasource.prototype.updateAffiliate = jest.fn().mockReturnValue(affiliate)
        let datasource = new Datasource
        let params = {
            affiliate: affiliate,
            emails: emails,
            updateAffiliateParams: updateAffiliateParams,
            datasource: datasource
        }
        return params
    }

    async clearDB (dbConf) {
        this.database = new GenesisDBTest(dbConf)
        let connection = await this.database.connection()
        let repository = connection.getRepository(AffiliateEmails)
        await repository.query(`SET FOREIGN_KEY_CHECKS = 0`)
        await repository.clear()
        repository = connection.getRepository(Affiliates)
        await repository.clear()
        // await repository.query(`TRUNCATE TABLE affiliates`);
        // await repository.query(`TRUNCATE TABLE affiliate_emails`);
        await repository.query(`SET FOREIGN_KEY_CHECKS = 1`)
    }

    async getInitialParamsDB (dbConf) {
        let affiliateEmail = 'test1@test.com'
        let database = new GenesisDBTest(dbConf)
        let connection = await database.connection()
        const affiliate = new Affiliates()
        affiliate.password = '$2b$10$n3SjnzXG0iIPXN94ebXJI.wIpuU2xlE0EC5MwLY5ZkFItKIEh2R86'
        affiliate.first_name = 'Test'
        affiliate.last_name = 'Testov'
        affiliate.created_date = floorTime(new Date)
        let affiliateRepository = connection.getRepository(Affiliates)
        let affiliateDB = await affiliateRepository.save(affiliate)

        const affiliateEmails = new AffiliateEmails()
        affiliateEmails.affiliate_id = affiliateDB.id
        affiliateEmails.token_id = 0
        affiliateEmails.email = affiliateEmail
        affiliateEmails.is_verified = false
        affiliateEmails.is_active = false
        affiliateEmails.created_date = floorTime(new Date)
        let affiliateEmailsRepository = connection.getRepository(AffiliateEmails)
        let emails = await affiliateEmailsRepository.save(affiliateEmails)

        return {affiliate: affiliateDB, emails: emails, affiliateEmail: affiliateEmail, database: database}
    }
}

module.exports = new Helper()