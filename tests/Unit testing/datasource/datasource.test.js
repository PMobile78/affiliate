const Affiliate = require('../../../services/Affiliate')
const Affiliates = require('../../../orm/models/Affiliate')
const AffiliateEmails = require('../../../orm/models/AffiliateEmail')
const {AuthenticationError, UserInputError, ForbiddenError, gql} = require('apollo-server-lambda')
const NotFound = require('../../../exceptions/NotFound')

const helper = require('../helper')

describe('Test working with DB', () => {
    beforeEach(async () => {
        let dbConf = {
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'pB28wuGH1ENZ',
            database: 'genesis_test',
            sync: true,
        }
        await helper.clearDB(dbConf)
        let paramsDB = await helper.getInitialParamsDB(dbConf)
        this.affiliate = paramsDB.affiliate
        this.emails = paramsDB.emails
        this.affiliateEmail = paramsDB.affiliateEmail
        this.database = paramsDB.database
    })

    it('getAffiliateByID = OK', async () => {
        let result = await this.database.getAffiliateByID(this.affiliate.id)
        expect(result.id).toBe(this.affiliate.id)
        expect(result.first_name).toBe(this.affiliate.first_name)
        expect(result.last_name).toBe(this.affiliate.last_name)
        expect(result.created_date).toBe(this.affiliate.created_date)

        expect(result.affiliate_emails[0].id).toBe(this.emails.id)
        expect(result.affiliate_emails[0].affiliate_id).toBe(this.emails.affiliate_id)
        expect(result.affiliate_emails[0].token_id).toBe(this.emails.token_id)
        expect(result.affiliate_emails[0].email).toBe(this.emails.email)
        expect(result.affiliate_emails[0].is_verified).toBe(this.emails.is_verified)
        expect(result.affiliate_emails[0].is_active).toBe(this.emails.is_active)
        expect(result.affiliate_emails[0].created_date).toBe(this.emails.created_date)
    })

    it('getAffiliateByID = Affiliate not found', async () => {
        await expect(this.database.getAffiliateByID(this.affiliate.id + 1)).rejects.toThrow(NotFound)
    })

    it('getAffiliateByEmail = OK', async () => {
        let result = await this.database.getAffiliateByEmail(this.affiliateEmail)
        expect(result.affiliate.id).toBe(this.affiliate.id)
        expect(result.affiliate.first_name).toBe(this.affiliate.first_name)
        expect(result.affiliate.last_name).toBe(this.affiliate.last_name)
        expect(result.affiliate.created_date).toBe(this.affiliate.created_date)

        expect(result.affiliate.affiliate_emails[0].id).toBe(this.emails.id)
        expect(result.affiliate.affiliate_emails[0].affiliate_id).toBe(this.emails.affiliate_id)
        expect(result.affiliate.affiliate_emails[0].token_id).toBe(this.emails.token_id)
        expect(result.affiliate.affiliate_emails[0].email).toBe(this.emails.email)
        expect(result.affiliate.affiliate_emails[0].is_verified).toBe(this.emails.is_verified)
        expect(result.affiliate.affiliate_emails[0].is_active).toBe(this.emails.is_active)
        expect(result.affiliate.affiliate_emails[0].created_date).toBe(this.emails.created_date)
    })

    it('getAffiliateByEmail = Affiliate not found', async () => {
        await expect(this.database.getAffiliateByEmail('emailNotFound@test.com')).rejects.toThrow(NotFound)
    })

    it('updateAffiliate - All fields are filled', async () => {
        let params = {
            id: this.affiliate.id,
            firstName: 'FirstName',
            lastName: 'LastName'
        }
        await this.database.updateAffiliate(
            params.id,
            params.firstName,
            params.lastName)
        let connection = await this.database.connection()
        let affiliateRepository = connection.getRepository(Affiliates)
        let affiliate = await affiliateRepository.findOne(params.id)
        expect(affiliate.id).toBe(params.id)
        expect(affiliate.firstName).toBe(params.first_name)
        expect(affiliate.lastName).toBe(params.last_name)
    })

    it('updateAffiliate - Fields are filled partially', async () => {
        let params = {
            id: this.affiliate.id,
        }
        let updatedAffiliate = await this.database.updateAffiliate(
            params.id,
        )
        let connection = await this.database.connection()
        let affiliateRepository = connection.getRepository(Affiliates)
        let affiliateFormDB = await affiliateRepository.findOne(params.id)
        expect(updatedAffiliate.id).toBe(affiliateFormDB.id)
        expect(updatedAffiliate.first_name).toBe(affiliateFormDB.first_name)
        expect(updatedAffiliate.last_name).toBe(affiliateFormDB.last_name)
    })

    it('updateAffiliate = Affiliate not found', async () => {
        let params = {
            id: this.affiliate.id,
        }
        await expect(this.database.updateAffiliate(
            params.id + 2,
        )).rejects.toThrow(NotFound)
    })
})