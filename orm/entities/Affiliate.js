const EntitySchema = require('typeorm').EntitySchema
const Affiliate = require('../models/Affiliate')

module.exports = new EntitySchema({
    name: 'Affiliate',
    target: Affiliate,
    tableName: 'affiliates',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
            unsigned: true
        },
        first_name: {
            type: 'varchar',
            length: 255
        },
        last_name: {
            type: 'varchar',
            length: 255
        },
        type: {
            type: 'varchar',
            length: 32
        },
        created_date: {
            type: 'int',
            unsigned: true
        }
    },
    relations: {
        affiliate_emails: {
            target: 'AffiliateEmail',
            type: 'one-to-many',
            inverseSide: 'affiliate',
            eager: true
        },
        affiliate_status: {
            target: 'AffiliateStatus',
            type: 'one-to-one',
            inverseSide: 'affiliate',
            eager: true
        },
        app_config: {
            target: 'AppConfig',
            type: 'one-to-one',
            inverseSide: 'affiliate',
            eager: false
        },
        affiliate_tiers: {
            target: 'AffiliateTier',
            type: 'one-to-one',
            inverseSide: 'affiliate',
            eager: false
        },
        affiliate_terms: {
            target: 'AffiliateTerms',
            type: 'one-to-many',
            inverseSide: 'affiliate',
            eager: true
        },
        affiliate_ratio: {
            target: 'AffiliateRatio',
            type: 'one-to-many',
            inverseSide: 'affiliate',
            eager: true
        },
    }
})