const {Exceptions: {Abstract}} = require('genesis-libs')

class NotVerifiedActiveEmail extends Abstract {
    constructor () {
        super()
        this.message = 'NOT_FOUND_VERIFIED_ACTIVE_EMAIL'
    }
}

module.exports = NotVerifiedActiveEmail