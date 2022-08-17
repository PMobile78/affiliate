const {EntitySchema} = require('typeorm')
const AffiliateTerms = require('../models/AffiliateTerms')

module.exports = new EntitySchema({
    name: 'AffiliateTerms',
    target: AffiliateTerms,
    tableName: 'affiliate_terms',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
            unsigned: true
        },
        affiliate_id: {
            type: 'int',
            width: 10,
            unsigned: true,
        },
        status: {
            type: 'varchar',
            width: 3,
            length: 255
        },
        version: {
            type: 'tinyint',
            unsigned: true
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
            type: 'many-to-one',
            joinColumn: {name: 'affiliate_id'}
        }
    }
})