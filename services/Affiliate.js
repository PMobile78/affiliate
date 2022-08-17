const camelcaseKeys = require('camelcase-keys')
const AffiliateStatusService = require('../services/AffiliateStatus')
const AffiliateStatusDB = require('../datasources/AffiliateStatusDB')
const AffiliateTagsDB = require('../datasources/AffiliateTagsDB')
const crypto = require('crypto')
const AffiliateHistoryService = require('./AffiliateHistory')
const AffiliateTags = require('./AffiliateTags')
const {SqsClient, ApolloClient, Config, Helpers:{floorTime}, Exceptions: {NotAllowed, BadInput}, logger, gql, Validation} = require('genesis-libs')
const statusDescription = require('../texts/status')
const affiliateTagsService = new AffiliateTags(new AffiliateTagsDB)

class Affiliate {
    constructor (database) {
        this.database = database
        this.startLoginDate = null
    }

    async byEmail (email) {
        let affiliateEmailInfo = await this.database.getAffiliateByEmail(email)
        let affiliate = camelcaseKeys(affiliateEmailInfo.affiliate)
        affiliate.emails = camelcaseKeys(affiliate.affiliateEmails)
        affiliate.status = affiliate.affiliateStatus.status
        delete affiliate.affiliateEmails
        delete affiliate.affiliateStatus
        affiliate.isSignedUpOnNewLogin = await this.isSignedUpOnNewLogin(affiliate.createdDate)
        return affiliate
    }

    async byActiveEmail (email) {
        let affiliateEmailInfo = await this.database.getAffiliateByActiveEmail(email)
        let affiliate = camelcaseKeys(affiliateEmailInfo.affiliate)
        affiliate.emails = camelcaseKeys(affiliate.affiliateEmails)
        affiliate.status = affiliate.affiliateStatus.status
        delete affiliate.affiliateEmails
        affiliate.isSignedUpOnNewLogin = await this.isSignedUpOnNewLogin(affiliate.createdDate)
        affiliate.isActiveEmailVerified = affiliateEmailInfo.is_verified
        return affiliate
    }

    async byID (id) {
        let affiliate = camelcaseKeys(await this.database.getAffiliateByID(id))
        affiliate.emails = camelcaseKeys(affiliate.affiliateEmails)
        affiliate.status = affiliate.affiliateStatus.status
        delete affiliate.affiliateEmails
        delete affiliate.affiliateStatus
        affiliate.isSignedUpOnNewLogin = await this.isSignedUpOnNewLogin(affiliate.createdDate)
        return affiliate
    }

    async allByIDs (ids, additionalParams = null) {
        if (additionalParams && additionalParams.hasOwnProperty('pageNumber')) {
            Validation.validate({
                pageNumber: ['isPositiveInt']
            },{
                pageNumber: '' + additionalParams.pageNumber
            })
        }
        if (additionalParams && additionalParams.hasOwnProperty('perPage')) {
            Validation.validate({
                perPage: ['isPositiveInt']
            },{
                perPage: '' + additionalParams.perPage
            })
        }
        let result = {}
        result.count = ids.length
        additionalParams.currentTermsVersion = await Config.get('terms.version')
        if (additionalParams && additionalParams.filter) {
            let addPreParams = Object.assign({}, additionalParams)
            addPreParams.perPage = null
            addPreParams.pageNumber = null
            logger.debug('Start getting count of affilaitesByIds')
            const allRaws = await this.database.getAffiliatesByIds(ids, addPreParams)
            logger.debug('Stop getting count of affilaitesByIds')
            result.count = allRaws.length
        }
        result.previousPage = (additionalParams.pageNumber > 1) ? additionalParams.pageNumber - 1 : null
        result.nextPage = ((result.count - (additionalParams.pageNumber * additionalParams.perPage)) > 0 ) ? additionalParams.pageNumber + 1 : null
        this.startLoginDate = new Date(await Config.get('signUpStartDate'))
        logger.debug('Start getting data for affiliates')
        let affiliatesData = camelcaseKeys(await this.database.getAffiliatesByIds(ids, additionalParams))
        let affiliatesDataIds = []
        if (affiliatesData.length && additionalParams && additionalParams.filter && additionalParams.filter.search) {
            affiliatesDataIds = affiliatesData.map(item => item.affiliateId)
            let newAdditionalParams = {
                currentTermsVersion: additionalParams.currentTermsVersion
            }
            if (additionalParams.sort) {
                newAdditionalParams = {
                    sort: additionalParams.sort
                }
            }
            affiliatesData = camelcaseKeys(await this.database.getAffiliatesByIds(affiliatesDataIds, newAdditionalParams))
        }
        result.affiliateList = affiliatesData.map(item => {
            let emails = []
            let itemEmails = (item.affiliateEmailsEmails).split(';')
            let itemEmailsIsActive = item.affiliateEmailsIsActives.split(';')
            let itemEmailsIsVerified = item.affiliateEmailsIsVerifieds.split(';')
            itemEmails.forEach((emailItem, index) => {
                if (emailItem) {
                    emails.push({
                        email: emailItem,
                        isVerified: +itemEmailsIsVerified[index],
                        isActive: +itemEmailsIsActive[index]
                    })
                }
            })
            let affiliate = {
                id: item.affiliateId,
                emails: emails,
                firstName: item.firstName,
                lastName: item.lastName,
                createdDate: item.createdDate,
                type: item.affiliateType,
                status: item.status,
                tier: item.tier || '',
                lastContactDate: item.lastContactDate,
                isSignedUpOnNewLogin: item.createdDate * 1000 >= this.startLoginDate,
                termStatus: 'accepted', // item.termStatus || 'haven’t seen',
                currentSales: (item.affiliateRatioCurrentSales ? item.affiliateRatioCurrentSales : 0),
                previousSales: (item.affiliateRatioPreviousSales ? item.affiliateRatioPreviousSales : 0),
                currentUniqVisits: (item.affiliateRatioCurrentUniqVisits ? item.affiliateRatioCurrentUniqVisits : 0),
                previousUniqVisits: (item.affiliateRatioPreviousUniqVisits ? item.affiliateRatioPreviousUniqVisits : 0),
                currentConversionRatio: (item.affiliateRatioCurrentConversionRatio ? item.affiliateRatioCurrentConversionRatio : 0),
                previousConversionRatio: (item.affiliateRatioPreviousConversionRatio ? item.affiliateRatioPreviousConversionRatio : 0),
                comparisonConversionRatio: (item.affiliateRatioComparison ? item.affiliateRatioComparison : 0),
            }
            return affiliate
        })
        logger.debug('Stop getting data for affiliates')
        return result
    }

    async update (id, firstName, lastName, fingerprint = '', sourceIp = '') {
        let affiliate = camelcaseKeys(await this.database.updateAffiliate(id, firstName, lastName, fingerprint, sourceIp))
        affiliate.emails = camelcaseKeys(affiliate.affiliateEmails)
        affiliate.status = affiliate.affiliateStatus.status
        delete affiliate.affiliateEmails
        delete affiliate.affiliateStatus
        affiliate.isSignedUpOnNewLogin = this.isSignedUpOnNewLogin(affiliate.createdDate)
        let employeeId = await this.getEmployeeId(id)
        let paymentMethod = await this.getPaymentMethod(id)
        const sqsClient = await SqsClient.get('hyuna')
        try {
            await sqsClient.sendSqsMessage({
                'entityType': 'updateAffiliate',
                'payload': {
                    'id': id,
                    'firstName': firstName,
                    'lastName': lastName,
                    'email': affiliate.emails[0].email,
                    'status': affiliate.status,
                    'affiliateType': affiliate.type,
                    'employeeId': employeeId,
                    'paymentType': paymentMethod,
                    'path': 'affiliates',
                    'dateAdded': ~~(Date.now() / 1000),
                    'type': 'update',
                    'affiliateId': id,
                }
            })
            logger.info('Message to `hyuna` queue was added!')
        } catch (error) {
            // skip errors to apply changes in db
            logger.error(error)
        }
        return affiliate
    }

    async updateType (id, type) {
        return camelcaseKeys(await this.database.updateAffiliateType(id, type))
    }

    async create (firstName, lastName, affiliateType, id) {
        logger.debug('starting create an affiliate')
        let affiliate = camelcaseKeys(await this.database.createAffiliate(firstName, lastName, affiliateType, id))
        logger.debug('done with the affiliate, creating his status')
        affiliate.emails = []
        const statusService = new AffiliateStatusService(new AffiliateStatusDB)
        await statusService.create({
            affiliateId: affiliate.id,
            status: 'pending',
            createdDate: affiliate.createdDate
        })
        logger.debug('done with his status')
        affiliate.status = 'pending'
        affiliate.isSignedUpOnNewLogin = await this.isSignedUpOnNewLogin(affiliate.createdDate)
        return affiliate
    }

    async affiliateWithReferralLink (affiliateId, status = 'pending') {
        let affiliate = await this.database.getAffiliateByID(affiliateId)
        let affiliateTermsStatus = ''
        const currentVersion = await Config.get('terms.version')
        affiliate.email = affiliate.affiliate_emails.find(record => record.is_active).email
        if (status === 'impersonated') {
            logger.info(`The affiliate ${affiliate.id}: ${affiliate.email} was impersonated by manager`)
            affiliate.termStatus = 'accepted'
            affiliate.status = 'active'
        } else {
            const virtualStatus = await affiliateTagsService.getAffiliateVirtualStatus(affiliateId, affiliate.affiliate_status.status)
            affiliate.status = virtualStatus === 'duplicated' ? 'pending' : affiliate.affiliate_status.status
            if (affiliate.affiliate_terms) {
                const affiliateTermsObject = affiliate.affiliate_terms.find(item => {
                    return item.version === currentVersion
                })
                affiliateTermsStatus = affiliateTermsObject ? affiliateTermsObject.status : 'haven’t seen'
            } else {
                affiliateTermsStatus = 'haven’t seen'
            }
            affiliate.termStatus = affiliateTermsStatus
        }
        delete affiliate.affiliate_terms
        delete affiliate.affiliate_emails
        delete affiliate.affiliate_status
        affiliate.date_added = affiliate.created_date
        affiliate.country_code = null
        affiliate.ref_link = 'https://www.crystads.com/signup/register?referral_link=' +
            crypto.createHash('md5')
                .update(String(affiliateId))
                .digest("hex")
        affiliate.statusDescription = statusDescription[affiliate.status] ? statusDescription[affiliate.status] : ''
        return affiliate
    }

    async isAllowUpdate (token) {
        const affiliateHistoryService = new AffiliateHistoryService()
        let affiliateUpdatedDate = await affiliateHistoryService.nameUpdatedDate(token)
        logger.debug('affiliateUpdatedDate: %d', affiliateUpdatedDate || 0)
        let deniedUpdateInterval = await Config.get('deniedUpdate.interval')
        logger.debug('deniedUpdateInterval: %d', deniedUpdateInterval)
        let actualDate = floorTime(new Date)
        logger.debug('actualDate: %d', actualDate)
        if (affiliateUpdatedDate && (actualDate - affiliateUpdatedDate) < deniedUpdateInterval) {
            logger.debug('Update is not allowed!')
            throw new NotAllowed('name', {frequency: 'month'})
        }
        logger.debug('Update is allowed!')
    }

    async getEmployeeId (affiliateId) {
        const client = await ApolloClient.get('managers')
        let query = gql`
            query accountExecutiveByAffiliateId($affiliateId: ID!) {
                accountExecutiveByAffiliateId(affiliateId: $affiliateId)
            }
        `
        const result = await client.query({
            query,
            variables: {
                affiliateId
            },
            fetchPolicy: 'no-cache', // we shouldn't cache this query
            context: {
                headers: {
                    Secret: await Config.get('api.managers.secret')
                }
            }
        })
        let queryName = query.definitions[0].name.value
        if (!result.data[queryName]) {
            return 0
        }
        return result.data[queryName]
    }

    async getPaymentMethod (affiliateId) {
        const client = await ApolloClient.get('paymentMethod')
        let query = gql`
            query paymentMethodsSecret($affiliateId: ID!) {
                paymentMethodsSecret(affiliateId: $affiliateId) {
                paymentMethod,
                accountId,
                isActive,
                order,
                id,
                status,
                bankInformation {
                  name,
                    addressLine1,
                    addressLine2,
                    city,
                    countryCode,
                    zipCode,
                    state,
                    swiftCode,
                    abaRoutingNumber,
                    accountNumberOrIban
                },
                beneficiaryInformation{
                   name,
                    addressLine1,
                    addressLine2,
                    city,
                    countryCode,
                    zipCode,
                    state,
                    id
                },
                intermediaryBankInformation {
                  name,
                    addressLine1,
                    addressLine2,
                    city,
                    countryCode,
                    zipCode,
                    state,
                    swiftCode,
                    abaRoutingNumber,
                    accountNumberOrIban
                },
                bankDetails, 
                }
            }
        `
        const result = await client.query({
            query,
            variables: {
                affiliateId
            },
            fetchPolicy: 'no-cache', // we shouldn't cache this query
            context: {
                headers: {
                    Secret: await Config.get('api.paymentMethod.secret')
                }
            }
        })
        let queryName = query.definitions[0].name.value
        if (!result.data[queryName]) {
            throw new BadInput({
                paymentMethod: `Payment methods of affiliate ID ${affiliateId} not found`
            })
        }
        let mainPaymentMethod = result.data[queryName].filter(function (paymentMethod) {
            return paymentMethod.order === 1
        })
        return mainPaymentMethod[0].paymentMethod
    }

    async isSignedUpOnNewLogin(affiliateCreatedDate) {
        if (!this.startLoginDate) {
            this.startLoginDate = new Date(await Config.get('signUpStartDate'))
        }
        return affiliateCreatedDate * 1000 >= this.startLoginDate
    }

}

module.exports = Affiliate