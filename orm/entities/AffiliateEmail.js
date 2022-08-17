const EntitySchema = require('typeorm').EntitySchema
const AffiliateEmail = require('../models/AffiliateEmail')

module.exports = new EntitySchema({
    name: 'AffiliateEmail',
    target: AffiliateEmail,
    tableName: 'affiliate_emails',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
            unsigned: true
        },
        affiliate_id: {
            type: 'int',
            unsigned: true
        },
        token_id: {
            type: 'bigint',
            default: null,
            unsigned: true
        },
        email: {
            type: 'varchar',
            length: 255
        },
        is_verified: {
            type: 'boolean',
            default: false
        },
        is_active: {
            type: 'boolean',
            default: true
        },
        created_date: {
            type: 'int',
            unsigned: true
        },
    },
    relations: {
        affiliate: {
            target: 'Affiliate',
            type: 'many-to-one',
            joinColumn: {name: 'affiliate_id'}
        }
    }
})