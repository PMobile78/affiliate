const {AbstractHistory, ApolloClient, gql} = require('genesis-libs')

class AffiliateEmailHistory extends AbstractHistory {
    get entityType () {
        return 'AffiliateEmailHistory'
    }

    customFieldName (oldData, newData) {
        return {
            affiliateId: oldData.affiliate_id || newData.affiliate_id,
            emailId: oldData.id || newData.id,
            fingerprint: newData.fingerprint,
            sourceIp: newData.sourceIp
        }
    }

    get excludedFields () {
        return ['id', 'created_date', 'affiliate_id', 'fingerprint', 'sourceIp']
    }

    async emailUpdatedDate (token) {
        const query = gql`
            query emailUpdatedDate {
            emailUpdatedDate
            }
          `
        let result = await (await ApolloClient.get('history')).query({
            query: query,
            context: {
                headers: {
                    authorization:token
                }
            },
            fetchPolicy: 'no-cache'
        })
        let action = query.definitions[0].name.value
        return result.data[action]
    }
}

module.exports = AffiliateEmailHistory