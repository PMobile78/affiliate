let GenesisDB = require('../datasources/GenesisDB')
let {createConnection, getConnection} = require('typeorm')

class GenesisDBTest extends GenesisDB {

    constructor (dbConf) {
        super()
        this.dbConf = dbConf
    }

    async connection () {
        try {
            return await getConnection()
        } catch (error) {
            return await createConnection({
                type: 'mysql',
                host: this.dbConf.host,
                port: this.dbConf.port,
                username: this.dbConf.username,
                password: this.dbConf.password,
                database: this.dbConf.database,
                synchronize: this.dbConf.sync,
                logging: false,
                entities: require('../orm')
            })
        }
    }
}

module.exports = GenesisDBTest