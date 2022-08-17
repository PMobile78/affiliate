const EntitySchema = require('typeorm').EntitySchema
const AffiliateTier = require('../models/AffiliateTier')

module.exports = new EntitySchema({
    name: 'AffiliateTier',
    target: AffiliateTier,
    tableName: 'affiliate_tiers',
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
        tier: {
            type: 'varchar',
            length: 50
        },
        created_date: {
            type: 'int',
            unsigned: true
        }
    },
    relations: {
        affiliate: {
            target: 'Affiliate',
            type: 'one-to-one',
            joinColumn: {name: 'affiliate_id'}
        }
    }
})