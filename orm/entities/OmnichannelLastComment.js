const {EntitySchema} = require('typeorm')
const OmnichannelLastComment = require('../models/OmnichannelLastComment')

module.exports = new EntitySchema({
    name: 'OmnichannelLastComment',
    target: OmnichannelLastComment,
    tableName: 'omnichannel_last_comment',
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
        ticket_id: {
            type: 'int',
            width: 10,
            unsigned: true,
        },
        author_role: {
            type: 'varchar',
            length: 20
        },
        author_id: {
            type: 'int',
            width: 10,
            unsigned: true,
        },
        updated_date: {
            type: 'int',
            width: 10,
            unsigned: true
        }
    }
})