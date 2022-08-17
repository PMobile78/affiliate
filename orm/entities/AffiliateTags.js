const EntitySchema = require('typeorm').EntitySchema
const AffiliateTags = require('../models/AffiliateTags')

module.exports = new EntitySchema({
    name: 'AffiliateTags',
    target: AffiliateTags,
    tableName: 'affiliate_tags',
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
        tag_id: {
            type: 'int',
            unsigned: true
        },
        created_date: {
            type: 'int',
            unsigned: true
        },
    },
    relations: {
        tags: {
            target: 'Tags',
            type: 'one-to-one',
            joinColumn: {name: 'tag_id'}
        }
    }
})