const Affiliate = require('../services/Affiliate')
const AppConfig = require('../services/AppConfig')
const GenesisDB = require('../datasources/GenesisDB')
const AppConfigDB = require('../datasources/AppConfigDB')
const AffiliateStatusService = require('../services/AffiliateStatus')
const AffiliateStatusDB = require('../datasources/AffiliateStatusDB')
const SignUp = require('../services/SignUp')
const PasswordService = require('../services/PasswordService')
const AffiliateTerms = require('../services/AffiliateTerms')
const AffiliateTermsDB = require('../datasources/AffiliateTermsDB')
const TrackTermsStatus = require('../services/TrackTermsStatus')
const AffiliateTrackTermsStatusDB = require('../datasources/AffiliateTrackTermsStatusDB')

module.exports = {
    Query: {
        affiliateByEmail: async (parent, {email}) => {
            let objAffiliate = new Affiliate(new GenesisDB)
            return objAffiliate.byEmail(email)
        },
        affiliateByActiveEmail: async (parent, {email}) => {
            let objAffiliate = new Affiliate(new GenesisDB)
            return objAffiliate.byActiveEmail(email)
        },
        affiliate: async (parent, params, {affiliateId}) => {
            let objAffiliate = new Affiliate(new GenesisDB)
            return objAffiliate.byID(affiliateId)
        },
        affiliateStatusById: async (parent, {id}) => {
            const statusService = new AffiliateStatusService(new AffiliateStatusDB)
            return statusService.byID(id)
        },
        affiliateStatus: async (parent, params, {status}) => {
            return status
        },
        affiliateByIDSecret: async (parent, params) => {
            let objAffiliate = new Affiliate(new GenesisDB)
            return objAffiliate.byID(params.affiliateId)
        },
        affiliates: async (parent, params, {affiliateId, status}) => {
            let objAffiliate = new Affiliate(new GenesisDB)
            return objAffiliate.affiliateWithReferralLink(affiliateId, status)
        },
        affiliatesByIdsSecret: async (parent, params) => {
            const service = new Affiliate(new GenesisDB)
            let additionalParams = {
                sort : params.sort ? params.sort : null,
                filter : params.filter ? params.filter : null
            }
            if (params.hasOwnProperty('perPage')) {
                additionalParams.perPage = params.perPage
            }
            if (params.hasOwnProperty('pageNumber')) {
                additionalParams.pageNumber = params.pageNumber
            }
            return service.allByIDs(params.ids, additionalParams)
        },
        getAppConfig: async (_, __, {affiliateId}) => {
            const service = new AppConfig(new AppConfigDB())
            return service.getAppConfigById(affiliateId)
        }
    },
    Mutation: {
        updateAffiliate: async (parent, {firstName, lastName, fingerprint}, {affiliateId, token, sourceIp}) => {
            let objAffiliate = new Affiliate(new GenesisDB)
            await objAffiliate.isAllowUpdate(token)
            return objAffiliate.update(affiliateId, firstName, lastName, fingerprint, sourceIp)
        },
        createAffiliate: async (parent, {email, password, firstName, lastName}) => {
            const serviceSignUp = new SignUp()
            return serviceSignUp.signUp(email, password, firstName, lastName)
        },
        updatePassword: async (parent, {oldPassword, newPassword, confirmPassword}, {affiliateId}) => {
            const servicePassword = new PasswordService()
            await servicePassword.updatePassword(oldPassword, newPassword, confirmPassword, affiliateId)
            return 'success'
        },
        setAppConfig: async (_, {config}, {affiliateId}) => {
            const service = new AppConfig(new AppConfigDB())
            return service.setAppConfig(affiliateId, config)
        },
        updateAcceptionTermsStatus: async (parent, params, {affiliateId}) => {
            const service = new AffiliateTerms(new AffiliateTermsDB())
            let result = await service.createOrUpdate({affiliateId, status: params.status})
            await service.sendToRabbit(result)
            return 'success'
        },
        updateTrackTermsStatus: async (parent, params, {affiliateId}) => {
            const service = new TrackTermsStatus(new AffiliateTrackTermsStatusDB())
            await service.createOrUpdate({affiliateId, status: params.status})
            return 'success'
        }
    },
}
