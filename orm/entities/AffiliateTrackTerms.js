const {EntitySchema} = require('typeorm')
const AffiliateTrackTerms = require('../models/AffiliateTrackTerms')

module.exports = new EntitySchema({
    name: 'AffiliateTrackTerms',
    target: AffiliateTrackTerms,
    tableName: 'affiliate_track_terms',
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
    }
})