const {ApolloClient, Config, Exceptions: {NotFound}, gql} = require('genesis-libs')

class Email {
    async changeEmail (oldEmail, email, token) {
        const client = await ApolloClient.get('email')
        let query = gql`
            query changeEmail($oldEmail: String!, $email: String!, $token: String!) {
                changeEmail(oldEmail: $oldEmail, email: $email, token: $token) {
                    status
                }
            }
        `
        const result = await client.query({
            query,
            variables: {
                oldEmail,
                email,
                token
            },
            fetchPolicy: 'no-cache', // we shouldn't cache this query
            context: {
                headers: {
                    Secret: await Config.get('api.email.secret')
                }
            }
        })
        let queryName = query.definitions[0].name.value
        if (!result.data[queryName]) {
            throw new NotFound('email', email)
        }
        return result.data[queryName]
    }
}

module.exports = Email