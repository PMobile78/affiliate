const {ApolloClient, Config, gql} = require('genesis-libs')

class Token {
    async createEmailToken (affiliateId) {
        let targetApi = await ApolloClient.get('tokenSecret')
        let mutation = gql`
            mutation createEmailTokenSecret($affiliateId: ID!) {
                createEmailTokenSecret(affiliateId: $affiliateId) {
                    body
                    tokenId
                    affiliateId
                }
            }
        `
        let result = await targetApi.mutate({
            mutation: mutation,
            variables: {
                affiliateId: affiliateId
            },
            context: {
                headers: {
                    Secret: await Config.get('api.tokenSecret.secret')
                }
            },
            fetchPolicy: 'no-cache'
        })
        let mutationName = mutation.definitions[0].name.value
        return result.data[mutationName]
    }
}

module.exports = Token
