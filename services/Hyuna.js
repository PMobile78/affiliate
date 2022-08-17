const {Config, logger} = require('genesis-libs')
let crypto = require('crypto')
const axios = require('axios')

class Hyuna {
    constructor () {

    }

    async callHyunaAPI (path, payload, type, id = 0) {
        let epoch = ~~(Date.now() / 1000)
        const {host, secret, enabled} = await Config.get('api.hyuna')
        if (!enabled) {
            return false
        }
        let data = await this.prepareAffiliateData(path, payload, type, id)
        let hash = crypto.createHash('md5').update(`${epoch}|api/v1/${path}|${secret}|${host}`).digest('hex')
        if (type !== 'save') {
            hash = crypto.createHash('md5').update(`${epoch}|api/v1/${path}/${id}|${secret}|${host}`).digest('hex')
        }
        let url = `${host}/api/v1/${path}?hash=${hash}&timestamp=${epoch}`
        if (type !== 'save') {
            url = `${host}/api/v1/${path}/${id}?hash=${hash}&timestamp=${epoch}`
            if (path === 'affiliate_programs') {
                url = `${host}/api/v1/${path}/${payload.id}/${payload.program_id}?hash=${hash}&timestamp=${epoch}`
            }
        }
        let result = await this.send(url, data, type)
    }

    async send (url, data, type) {
        let method = 'POST'
        if (type === 'delete') {
            method = 'DELETE'
        }
        if (type === 'update') {
            method = 'PUT'
        }
        try {
            const options = {
                method: method,
                headers: {'content-type': 'application/json', 'Content-Length': data.length},
                data: data,
                url,
            }
            let result = await axios(options)
            logger.debug('The affiliate was sent to Hyuna')
            return result
        } catch (error) {
            logger.error(error)
        }
    }

    async prepareAffiliateData (table, payload, type, id) {
        switch (table) {
            case 'affiliates':
                if (type !== 'save') {
                    return JSON.stringify(
                        {
                            'media_network_type_id': payload.mediaNetworkTypeId ? payload.mediaNetworkTypeId : 0,
                            'email': payload.email,
                            'default_campaign_id': payload.defaultCampaignId ? payload.defaultCampaignId : 0,
                            'default_mobile_campaign_id': payload.defaultMobileCampaignId ? payload.defaultMobileCampaignId : 0,
                            'first_name': payload.firstName,
                            'last_name': payload.lastName,
                            'country_code': payload.countryCode ? payload.countryCode : '',
                            'status': payload.status,
                            'affiliate_type': payload.affiliateType,
                            'employee_id': payload.employeeId,
                            'payment_type': payload.paymentType ? payload.paymentType : '',
                            'is_blocked': payload.isBlocked ? payload.isBlocked : 0,
                            'is_traffic_blocked': payload.isTrafficBlocked ? payload.isTrafficBlocked : 0,
                            'is_suspended': payload.isSuspended ? payload.isSuspended : 0,
                            'account_mgr_id': payload.accountMgrId ? payload.accountMgrId : 0,
                            'is_blacklisted': payload.isBlacklisted ? payload.isBlacklisted : 0,
                            'advertiser_id': payload.advertiserId ? payload.advertiserId : 0,
                        }
                    )
                }
                return JSON.stringify(
                    {
                        'id': id,
                        'date_added': payload.dateAdded,
                        'media_network_type_id': payload.mediaNetworkTypeId ? payload.mediaNetworkTypeId : 0,
                        'email': payload.email,
                        'default_campaign_id': payload.defaultCampaignId ? payload.defaultCampaignId : 0,
                        'default_mobile_campaign_id': payload.defaultMobileCampaignId ? payload.defaultMobileCampaignId : 0,
                        'first_name': payload.firstName,
                        'last_name': payload.lastName,
                        'country_code': payload.countryCode ? payload.countryCode : '',
                        'status': payload.status,
                        'affiliate_type': payload.affiliateType,
                        'employee_id': payload.employeeId,
                        'payment_type': payload.paymentType ? payload.paymentType : '',
                        'is_blocked': payload.isBlocked ? payload.isBlocked : 0,
                        'is_traffic_blocked': payload.isTrafficBlocked ? payload.isTrafficBlocked : 0,
                        'is_suspended': payload.isSuspended ? payload.isSuspended : 0,
                        'account_mgr_id': payload.accountMgrId ? payload.accountMgrId : 0,
                        'is_blacklisted': payload.isBlacklisted ? payload.isBlacklisted : 0,
                        'advertiser_id': payload.advertiserId ? payload.advertiserId : 0,
                    }
                )
            // HAVEN'T TESTED SECTION YET!
            case 'programs':
                if (type !== 'save') {
                    return JSON.stringify({
                        'name': payload.name, //string required
                        'group_id': payload.group_id ? payload.group_id : 0, //integer required
                        'status': payload.status, //string required
                        'payout_type': payload.payout_type, //string required
                        'payout_amount': payload.payout_amount, //double required
                        'pps_type': payload.pps_type, //string required
                        'allow_on_signup': payload.allow_on_signup ? payload.allow_on_signup : 0, //integer required
                        'site_id': payload.site_id, //integer required
                        'advertiser_id': payload.advertiser_id, //integer required
                        'hide_sales_to_affiliate': payload.hide_sales_to_affiliate //integer required
                    })
                }
                return JSON.stringify({
                    'id': payload.id, //integer required
                    'date_added': payload.dateAdded, //integer required
                    'name': payload.name, //string required
                    'group_id': payload.group_id ? payload.group_id : 0, //integer required
                    'status': payload.status, //string required
                    'payout_type': payload.payout_type, //string required
                    'payout_amount': payload.payout_amount, //double required
                    'pps_type': payload.pps_type, //string required
                    'allow_on_signup': payload.allow_on_signup ? payload.allow_on_signup : 0, //integer required
                    'site_id': payload.site_id, //integer required
                    'advertiser_id': payload.advertiser_id, //integer required
                    'hide_sales_to_affiliate': payload.hide_sales_to_affiliate //integer required
                })
            case 'affiliate_programs':
                if (type === 'delete') {
                    return
                }
                if (type !== 'save') {
                    return JSON.stringify({
                        'use_default_price': payload.use_default_price, //integer required
                        'affiliate_price': payload.affiliate_price, //double required
                    })
                }
                return JSON.stringify({
                    'affiliate_id': payload.affiliate_id, //integer required
                    'program_id': payload.program_id, //integer required
                    'date_added': payload.dateAdded, //integer required
                    'use_default_price': payload.use_default_price, //integer required
                    'affiliate_price': payload.affiliate_price, //double required
                })

            case 'affiliate_program_logs':
                if (type !== 'save') {
                    return JSON.stringify({
                        'affiliate_id': payload.affiliate_id, //integer required
                        'program_id': payload.program_id, //integer required
                        'employee_id': payload.employee_id, //integer required
                        'action': payload.action, //string required
                        'use_default_price': payload.use_default_price, //integer required
                        'price': payload.price, //double required
                    })
                }
                return JSON.stringify({
                    'id': payload.id ? payload.id : id, //integer required
                    'date_added': payload.dateAdded, //integer required
                    'affiliate_id': payload.affiliate_id, //integer required
                    'program_id': payload.program_id, //integer required
                    'employee_id': payload.employee_id, //integer required
                    'action': payload.action, //string required
                    'use_default_price': payload.use_default_price, //integer required
                    'price': payload.price, //double required
                })
            case 'program_country_overrides':
                if (type === 'delete') {
                    return
                }
                if (type !== 'save') {
                    return JSON.stringify({
                        'program_id': payload.program_id, //integer required
                        'country_code': payload.country_code, //string required
                        'payout_amount': payload.payout_amount, //double required
                    })
                }
                return JSON.stringify({
                    'id': payload.id ? payload.id : id, //integer required
                    'program_id': payload.program_id, //integer required
                    'country_code': payload.country_code, //string required
                    'payout_amount': payload.payout_amount, //double required
                })


            case 'affiliate_program_country_overrides':
                if (type === 'delete') {
                    return
                }
                if (type !== 'save') {
                    return JSON.stringify({
                        'affiliate_id': payload.affiliate_id, //integer required
                        'program_id': payload.program_id, //integer required
                        'country_code': payload.country_code, //string required
                        'payout_amount': payload.payout_amount, //double required
                    })
                }
                return JSON.stringify({
                    'id': payload.id ? payload.id : id, //integer required
                    'affiliate_id': payload.affiliate_id, //integer required
                    'program_id': payload.program_id, //integer required
                    'country_code': payload.country_code, //string required
                    'payout_amount': payload.payout_amount, //double required
                })
            case 'affiliate_product_programs':
                if (type === 'delete') {
                    return
                }
                if (type !== 'save') {
                    return JSON.stringify({
                        'affiliate_id': payload.affiliate_id, //integer required
                        'program_id': payload.program_id, //integer required
                        'product_id': payload.product_id, //integer required
                    })
                }
                return JSON.stringify({
                    'id': payload.id ? payload.id : id, //integer required
                    'date_added': payload.dateAdded, //integer required
                    'affiliate_id': payload.affiliate_id, //integer required
                    'program_id': payload.program_id, //integer required
                    'product_id': payload.product_id, //integer required
                })
            case 'affiliate_products':
                if (type === 'delete') {
                    return
                }
                if (type !== 'save') {
                    return JSON.stringify({
                        'affiliate_id': payload.affiliate_id, //integer required
                        'product_id': payload.product_id, //integer required
                        'status': payload.status ? payload.status : 'active', //string required
                    })
                }
                return JSON.stringify({
                    'id': payload.id ? payload.id : id, //integer required
                    'date_added': payload.dateAdded, //integer required
                    'affiliate_id': payload.affiliate_id, //integer required
                    'product_id': payload.product_id, //integer required
                    'status': payload.status ? payload.status : 'active', //string required
                })
            case 'ac_products':
                if (type === 'delete') {
                    return
                }
                if (type !== 'save') {
                    return JSON.stringify({
                        'name': payload.name, //integer required
                        'status': payload.status, //string required
                        'program_id': payload.program_id, //integer required
                        'advertiser_id': payload.advertiser_id, //integer required
                    })
                }
                return JSON.stringify({
                    'id': payload.id ? payload.id : id, //integer required
                    'date_added': payload.dateAdded, //integer required
                    'name': payload.name, //integer required
                    'status': payload.status, //string required
                    'program_id': payload.program_id, //integer required
                    'advertiser_id': payload.advertiser_id, //integer required
                })
            case 'buckets_products':
                if (type === 'delete') {
                    return
                }
                if (type !== 'save') {
                    return JSON.stringify({
                        'product_id': payload.product_id, //integer required
                        'bucket_id': payload.bucket_id,  //integer required
                    })
                }
                return JSON.stringify({
                    'id': payload.id ? payload.id : id, //integer required
                    'product_id': payload.product_id, //integer required
                    'bucket_id': payload.bucket_id,  //integer required
                })
            case 'refcodes':
                if (type !== 'save') {
                    return JSON.stringify({
                        'campaign_id': payload.campaign_id, //integer required
                        'program_id': payload.program_id, //integer required
                        'affiliate_id': payload.affiliate_id, //integer required
                        'product_id': payload.product_id, //integer required
                    })
                }
                return JSON.stringify({
                    'id': payload.id ? payload.id : id, //integer required
                    'campaign_id': payload.campaign_id, //integer required
                    'program_id': payload.program_id, //integer required
                    'affiliate_id': payload.affiliate_id, //integer required
                    'product_id': payload.product_id, //integer required
                })
            case 'campaigns':
                if (type !== 'save') {
                    return JSON.stringify({
                        'name': payload.name, //integer required
                        'affiliate_id': payload.affiliate_id, //integer required
                        'status': payload.status, //integer required
                        'mobile': payload.mobile, //integer required
                        'prod_id': payload.prod_id ? payload.prod_id : 0, //integer required
                        'active_sizes': payload.active_sizes ? payload.active_sizes : '', //string required
                        'active_products': payload.active_products ? payload.active_products : '',//string required

                    })
                }
                return JSON.stringify({
                    'id': payload.id ? payload.id : id, //integer required
                    'name': payload.name, //integer required
                    'affiliate_id': payload.affiliate_id, //integer required
                    'status': payload.status, //integer required
                    'date_added': payload.date_added, //integer required
                    'mobile': payload.mobile, //integer required
                    'prod_id': payload.prod_id ? payload.prod_id : 0, //integer required
                    'active_sizes': payload.active_sizes ? payload.active_sizes : '', //string required
                    'active_products': payload.active_products ? payload.active_products : '',//string required
                })
        }
    }

}

module.exports = Hyuna