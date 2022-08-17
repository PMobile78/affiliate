const Affiliate = require('../../../services/Affiliate')
const helper = require('../helper')


describe('Test services', () => {
    beforeEach(async () => {
        let params = await helper.getInitialParams()
        this.affiliate = params.affiliate
        this.emails = params.emails
        this.updateAffiliateParams = params.updateAffiliateParams
        this.database = params.datasource
    })
    it('getAffiliateByID', async () => {
        let objAffiliate = new Affiliate(this.database)
        let result = await objAffiliate.byID(this.affiliate.id)
        expect(result.id).toBe(this.affiliate.id)
        expect(result.password).toBe(this.affiliate.password)
        expect(result.firstName).toBe(this.affiliate.first_name)
        expect(result.lastName).toBe(this.affiliate.last_name)
        expect(result.createdDate).toBe(this.affiliate.created_date)

        expect(result.emails[0].id).toBe(this.emails[0].id)
        expect(result.emails[0].affiliateId).toBe(this.emails[0].affiliate_id)
        expect(result.emails[0].tokenId).toBe(this.emails[0].token_id)
        expect(result.emails[0].email).toBe(this.emails[0].email)
        expect(result.emails[0].isVerified).toBe(this.emails[0].is_verified)
        expect(result.emails[0].isActive).toBe(this.emails[0].is_active)
        expect(result.emails[0].createdDate).toBe(this.emails[0].created_date)

        expect(this.database.getAffiliateByID.mock.calls[0][0]).toBe(this.affiliate.id)
    })

    it('getAffiliateByEmail', async () => {
        let email = this.emails[0]
        email.affiliate = this.affiliate
        let objAffiliate = new Affiliate(this.database)
        let result = await objAffiliate.byEmail(this.emails[0].email)
        expect(result.id).toBe(this.affiliate.id)
        expect(result.password).toBe(this.affiliate.password)
        expect(result.firstName).toBe(this.affiliate.first_name)
        expect(result.lastName).toBe(this.affiliate.last_name)
        expect(result.createdDate).toBe(this.affiliate.created_date)

        expect(result.emails[0].id).toBe(this.emails[0].id)
        expect(result.emails[0].affiliateId).toBe(this.emails[0].affiliate_id)
        expect(result.emails[0].tokenId).toBe(this.emails[0].token_id)
        expect(result.emails[0].email).toBe(this.emails[0].email)
        expect(result.emails[0].isVerified).toBe(this.emails[0].is_verified)
        expect(result.emails[0].isActive).toBe(this.emails[0].is_active)
        expect(result.emails[0].createdDate).toBe(this.emails[0].created_date)

        expect(this.database.getAffiliateByEmail.mock.calls[0][0]).toBe(this.emails[0].email)
    })

    it('updateAffiliate', async () => {
        let objAffiliate = new Affiliate(this.database)
        let result = await objAffiliate.update(
            this.affiliate.id,
            this.updateAffiliateParams.firstName,
            this.updateAffiliateParams.lastName)
        expect(result).toContainEntries(
            [
                ['id', this.affiliate.id],
                ['firstName', this.updateAffiliateParams.firstName],
                ['lastName', this.updateAffiliateParams.lastName],
                ['createdDate', this.affiliate.created_date],
            ]
        )
        // expect(result.id).toBe(this.affiliate.id)
        // expect(result.password).toBe(this.updateAffiliateParams.password)
        // expect(result.firstName).toBe(this.updateAffiliateParams.firstName)
        // expect(result.lastName).toBe(this.updateAffiliateParams.lastName)
        // expect(result.createdDate).toBe(this.affiliate.created_date)

        expect(result.emails[0].id).toBe(this.emails[0].id)
        expect(result.emails[0].affiliateId).toBe(this.emails[0].affiliate_id)
        expect(result.emails[0].tokenId).toBe(this.emails[0].token_id)
        expect(result.emails[0].email).toBe(this.emails[0].email)
        expect(result.emails[0].isVerified).toBe(this.emails[0].is_verified)
        expect(result.emails[0].isActive).toBe(this.emails[0].is_active)
        expect(result.emails[0].createdDate).toBe(this.emails[0].created_date)

        // expect(this.database.update.mock.calls[0][0]).toBe(this.affiliate.id)
        // expect(this.database.update.mock.calls[0][2]).toBe(this.updateAffiliateParams.firstName)
        // expect(this.database.update.mock.calls[0][3]).toBe(this.updateAffiliateParams.lastName)
    })
})