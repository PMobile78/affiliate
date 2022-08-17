const {EntitySchema} = require('typeorm')
const AppConfig = require('../models/AppConfig')

module.exports = new EntitySchema({
    name: 'AppConfig',
    target: AppConfig,
    tableName: 'app_config',
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
        config: {
            type: 'text'
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