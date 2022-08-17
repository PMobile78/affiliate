const EntitySchema = require('typeorm').EntitySchema
const AffiliateRatio = require('../models/AffiliateRatio')

module.exports = new EntitySchema({
    name: 'AffiliateRatio',
    target: AffiliateRatio,
    tableName: 'affiliate_ratio',
    columns: {
        affiliate_id: {
            primary: true,
            type: 'int',
            width: 10,
            unsigned: true,
        },
        current_sales: {
            type: 'int'
        },
        previous_sales: {
            type: 'int'
        },
        current_uniq_visits: {
            type: 'int'
        },
        previous_uniq_visits: {
            type: 'int'
        },
        current_conversion_ratio: {
            type: 'float'
        },
        previous_conversion_ratio: {
            type: 'float'
        },
        comparison: {
            type: 'float'
        },
    },
    relations: {
        affiliate: {
            target: 'Affiliate',
            type: 'one-to-one',
            joinColumn: {name: 'affiliate_id'}
        }
    }
})