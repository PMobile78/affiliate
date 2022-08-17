const Affiliate = require('../orm/models/Affiliate')
const OmnichannelLastComment = require('../orm/models/OmnichannelLastComment')
const AffiliateEmail = require('../orm/models/AffiliateEmail')
const {AbstractDB, Helpers: {floorTime}, Exceptions: {NotFound}, logger} = require('genesis-libs')
const typeorm = require('typeorm')
const {Brackets} = require('typeorm')
class GenesisDB extends AbstractDB {

    get typeorm () {
        return typeorm
    }

    async getAffiliateByEmail (email) {
        let connection = await this.connection()
        let emailRepository = connection.getRepository(AffiliateEmail)
        let result = await emailRepository.findOne({
            where: {email},
            relations: ['affiliate']
        })
        if (!result) {
            throw new NotFound('affiliate', email)
        }
        return result
    }

    async getAffiliateByActiveEmail (email) {
        let connection = await this.connection()
        let emailRepository = connection.getRepository(AffiliateEmail)
        let result = await emailRepository.findOne({
            where: {email, is_active: 1},
            relations: ['affiliate']
        })
        if (!result) {
            throw new NotFound('affiliate', email)
        }
        return result
    }

    async getActiveEmailByID (id) {
        const connection = await this.connection()
        const emailRepository = connection.getRepository(AffiliateEmail)
        const result = await emailRepository.findOne({
            where: {
                affiliate_id: id,
                is_active: 1
            }
        })
        if (!result) {
            throw new NotFound('affiliate_emails', id)
        }
        return result.email
    }

    async getAffiliateByID (id) {
        let connection = await this.connection()
        let affiliateRepository = connection.getRepository(Affiliate)
        let result = await affiliateRepository.findOne(id)
        if (!result) {
            throw new NotFound('affiliate', id)
        }
        return result
    }

    async getAffiliatesByIds (ids, additionalParams=null) {
        if (!ids || !ids.length) {
            return []
        }
        let order = {}
        if (additionalParams && additionalParams.sort && additionalParams.sort.length) {
            additionalParams.sort.forEach((item) => {
                switch (item.field) {
                    case 'status':
                        order['status.' + item.field] = item.type
                        break;
                    case 'createdDate':
                        order['affiliate.created_date'] = item.type
                        break;
                    case 'firstName':
                        order['affiliate.first_name'] = item.type
                        break;
                    case 'lastName':
                        order['affiliate.last_name'] = item.type
                        break;
                    case 'tier':
                        order['affiliate_tiers.' + item.field] = item.type
                        break;
                    case 'lastContactDate':
                        order['omnichannel_last_comment.last_contact_date'] = item.type
                        break;
                    case 'comparisonConversionRatio':
                        order['COALESCE(affiliate_ratio.comparison,0)'] = item.type
                        break;
                    case 'currentConversionRatio':
                        order['COALESCE(affiliate_ratio.current_conversion_ratio,0)'] = item.type
                        break;
                }
            })
        }
        let connection = await this.connection()

        let lastContactQuery = connection.createQueryBuilder(OmnichannelLastComment, 'omnichannel_last_comment')
            .select('omnichannel_last_comment.affiliate_id', 'omnichannel_last_comment_affiliate_id')
            .addSelect('MAX(omnichannel_last_comment.updated_date)', 'last_contact_date')
            .where('omnichannel_last_comment.affiliate_id IN (:...affiliateIds)', {affiliateIds: ids})
            .groupBy('omnichannel_last_comment.affiliate_id')

        let query = connection.createQueryBuilder(Affiliate, 'affiliate')
            .select('affiliate.id', 'affiliate_id')
            .addSelect('(affiliate.first_name)', 'first_name')
            .addSelect('(affiliate.last_name)', 'last_name')
            .addSelect('(affiliate.type)', 'affiliate_type')
            .addSelect('(affiliate.created_date)', 'created_date')

            .addSelect('(status.status)', 'status')

            .addSelect("GROUP_CONCAT(affiliate_emails.email ORDER BY affiliate_emails.id ASC SEPARATOR ';' ) " , 'affiliate_emails_emails')
            .addSelect("GROUP_CONCAT(affiliate_emails.is_verified ORDER BY affiliate_emails.id ASC SEPARATOR ';' ) " , 'affiliate_emails_is_verifieds')
            .addSelect("GROUP_CONCAT(affiliate_emails.is_active ORDER BY affiliate_emails.id ASC SEPARATOR ';' ) " , 'affiliate_emails_is_actives')

            .addSelect('(affiliate_tiers.tier)', 'tier')
            .addSelect('(affiliate_terms.status)', 'termStatus')

            .leftJoinAndSelect('affiliate.affiliate_status', 'status')
            .leftJoinAndSelect('affiliate.affiliate_emails', 'affiliate_emails')
            .leftJoinAndSelect('affiliate.affiliate_tiers', 'affiliate_tiers')
            .leftJoinAndSelect('affiliate.affiliate_ratio', 'affiliate_ratio')
            .leftJoinAndSelect("(" + lastContactQuery.getQuery() + ")", 'omnichannel_last_comment', 'omnichannel_last_comment.omnichannel_last_comment_affiliate_id = affiliate.id')
            .leftJoinAndSelect('affiliate.affiliate_terms', 'affiliate_terms', 'affiliate_terms.version = :termsVersion', {termsVersion: additionalParams.currentTermsVersion})
            .where('affiliate.id IN (:...ids)', {ids: ids})
            .setParameters(lastContactQuery.getParameters())
            .orderBy(order)
            .groupBy('affiliate.id')

        if (additionalParams && additionalParams.filter && additionalParams.filter.search) {
            query.andWhere(new Brackets(qb => {
                qb.where('affiliate.first_name like :firstName', {firstName: `%${additionalParams.filter.search}%`})
                    .orWhere('affiliate.last_name like :lastName', {lastName: `%${additionalParams.filter.search}%`})
                    .orWhere('affiliate_emails.email like :email', {email: `%${additionalParams.filter.search}%`})
                    .orWhere('affiliate.id like :filterId', {filterId: `%${additionalParams.filter.search}%`})
            }))
        }
        if (additionalParams && additionalParams.filter && additionalParams.filter.status) {
            if (additionalParams.filter.status !== 'active') {
                query.andWhere('status.status != :status', {status: "active"})
            } else {
                query.andWhere('status.status = :status', {status: "active"})
            }
        }
        if (additionalParams && additionalParams.perPage && additionalParams.pageNumber) {
            let page = (additionalParams.pageNumber == 0 ) ? 0 : additionalParams.pageNumber - 1
            query.offset(additionalParams.perPage * page)
            query.limit(additionalParams.perPage)
        }
        return await query.getRawMany()
    }

    async createAffiliate (firstName, lastName, affiliateType, id) {
        let connection = await this.connection()
        const affiliate = new Affiliate(id, firstName, lastName, affiliateType, floorTime(new Date))
        let affiliateRepository = connection.getRepository(Affiliate)
        return await affiliateRepository.save(affiliate)
    }

    async updateAffiliate (id, firstName, lastName, fingerprint, sourceIp) {
        const partialAffiliate = {
            id: Number(id),
            first_name: firstName,
            last_name: lastName
        }
        let connection = await this.connection()
        const affiliate = await connection.manager.preload(Affiliate, partialAffiliate)
        if (!affiliate) {
            throw new NotFound('affiliate', id)
        }
        affiliate.fingerprint = fingerprint
        affiliate.sourceIp = sourceIp
        return connection.manager.save(affiliate)
    }

    async updateAffiliateType (affiliateId, newType) {
        let connection = await this.connection()
        let affiliateRepository = connection.getRepository(Affiliate)
        const affiliate = await affiliateRepository.findOne(+affiliateId)
        if (!affiliate) {
            throw new NotFound('affiliate', affiliateId)
        }
        affiliate.type = newType
        return affiliateRepository.save(affiliate)
    }

    async createAffiliateEmail (affiliateId, email, isActive, fingerprint = '', sourceIp = '') {
        logger.debug('starting create email')
        let connection = await this.connection()
        const affiliateEmail = new AffiliateEmail(
            undefined,
            affiliateId,
            email,
            null,
            false,
            isActive,
            floorTime(new Date)
        )
        let affiliateEmailRepository = connection.getRepository(AffiliateEmail)
        affiliateEmail.fingerprint = fingerprint
        affiliateEmail.sourceIp = sourceIp
        const result = affiliateEmailRepository.save(affiliateEmail)
        logger.debug('done with email')
        return result
    }

    async confirmEmailWithoutToken (affiliateId, email) {
        let connection = await this.connection()
        let affiliateRepository = connection.getRepository(AffiliateEmail)
        let affiliateEmail = await affiliateRepository.findOne({
            where:
                {
                    affiliate_id: affiliateId,
                    email: email
                }
        })
        if (!affiliateEmail) {
            throw new NotFound('affiliate email', email)
        }
        const affiliateEmailUpdate = await connection.manager.merge(AffiliateEmail, affiliateEmail, {
            is_verified: true
        })
        return connection.manager.save(affiliateEmailUpdate)
    }

    async confirmAffiliateEmail (affiliateId, tokenId, fingerprint = '', sourceIp = '') {
        let connection = await this.connection()
        let affiliateEmailRepository = connection.getRepository(AffiliateEmail)
        let affiliateOldEmail = await affiliateEmailRepository.findOne({
            where:
                {
                    affiliate_id: affiliateId,
                    is_active: true
                }
        })
        if (!affiliateOldEmail) {
            throw new NotFound('affiliate email', affiliateId)
        }
        affiliateOldEmail.is_active = false
        affiliateOldEmail.fingerprint = fingerprint
        affiliateOldEmail.sourceIp = sourceIp
        await connection.manager.save(affiliateOldEmail)
        let affiliateEmail = await affiliateEmailRepository.findOne({
            where:
                {
                    affiliate_id: affiliateId,
                    token_id: tokenId
                }
        })
        if (!affiliateEmail) {
            throw new NotFound('affiliate email', tokenId)
        }
        const affiliateEmailUpdate = await connection.manager.merge(AffiliateEmail, affiliateEmail, {
            is_verified: true,
            is_active: true
        })
        affiliateEmailUpdate.fingerprint = fingerprint
        affiliateEmailUpdate.sourceIp = sourceIp
        return connection.manager.save(affiliateEmailUpdate)
    }

    async updateToken (affiliateId, email, tokenId) {
        let connection = await this.connection()
        await connection
            .createQueryBuilder()
            .update(AffiliateEmail)
            .set({ token_id: tokenId })
            .where('email = :email', { email: email })
            .execute()
        let affiliateRepository = connection.getRepository(AffiliateEmail)
        let affiliateEmail = await affiliateRepository.findOne({
            where: {
                affiliate_id: affiliateId,
                email: email
            }
        })
        if (!affiliateEmail) {
            throw new NotFound('affiliate email', email)
        }
        return affiliateEmail
    }

    async changeEmail (affiliateId, oldEmail, newEmail) {
        const connection = await this.connection()
        await connection
            .createQueryBuilder()
            .update(AffiliateEmail)
            .set({
                is_active: 0
            })
            .where({
                affiliate_id: affiliateId,
                email: oldEmail
            })
            .execute()
        await connection
            .createQueryBuilder()
            .update(AffiliateEmail)
            .set({
                is_active: 1
            })
            .where({
                affiliate_id: affiliateId,
                email: newEmail
            })
            .execute()
    }
}

module.exports = GenesisDB
