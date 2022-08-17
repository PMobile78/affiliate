const {AbstractHistory, ApolloClient, gql} = require('genesis-libs')

class AffiliateHistory extends AbstractHistory {
    get entityType () {
        return 'AffiliateHistory'
    }

    customFieldName (oldData, newData) {
        return {
            affiliateId: oldData.id || newData.id,
            fingerprint: newData.fingerprint,
            sourceIp: newData.sourceIp
        }
    }

    get excludedFields () {
        return ['id', 'created_date', 'affiliate_id', 'fingerprint', 'sourceIp', 'affiliate_status']
    }

    async nameUpdatedDate (token) {
        const query = gql`
            query nameUpdatedDate {
            nameUpdatedDate
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

module.exports = AffiliateHistory