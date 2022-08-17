const {EntitySchema} = require('typeorm')
const AffiliateStatus = require('../models/AffiliateStatus')

module.exports = new EntitySchema({
    name: 'AffiliateStatus',
    target: AffiliateStatus,
    tableName: 'affiliate_status',
    columns: {
        affiliate_id: {
            primary: true,
            type: 'int',
            width: 10,
            unsigned: true,
        },
        status: {
            type: 'varchar',
            length: 255
        },
        created_date: {
            type: 'int',
            width: 10,
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