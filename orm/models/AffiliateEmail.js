class AffiliateEmail {
    constructor (id, affiliate_id, email, token_id, is_verified, is_active, created_date) {
        this.id = id
        this.affiliate_id = affiliate_id
        this.email = email
        this.is_verified = is_verified
        this.is_active = is_active
        this.created_date = created_date
        this.token_id = token_id
    }
}

module.exports = AffiliateEmail

