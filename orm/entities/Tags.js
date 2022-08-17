const EntitySchema = require('typeorm').EntitySchema
const Tags = require('../models/Tags')

module.exports = new EntitySchema({
    name: 'Tags',
    target: Tags,
    tableName: 'tags',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
            unsigned: true
        },
        name: {
            type: 'varchar',
            length: 255
        },
        created_date: {
            type: 'int',
            unsigned: true
        },
    }
})