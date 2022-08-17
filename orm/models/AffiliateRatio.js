class AffiliateRatio {
    constructor (
        affiliate_id,
        current_sales,
        previous_sales,
        current_uniq_visits,
        previous_uniq_visits,
        current_conversion_ratio,
        previous_conversion_ratio,
        comparison
    ) {
        this.affiliate_id = affiliate_id
        this.current_sales = current_sales
        this.previous_sales = previous_sales
        this.current_uniq_visits = current_uniq_visits
        this.previous_uniq_visits = previous_uniq_visits
        this.current_conversion_ratio = current_conversion_ratio
        this.previous_conversion_ratio = previous_conversion_ratio
        this.comparison = comparison
    }
}

module.exports = AffiliateRatio