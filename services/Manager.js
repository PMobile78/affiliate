const {ApolloClient, Config, Exceptions: {NotFound}, gql} = require('genesis-libs')

class Manager {
    async managerByEmail (managerEmail) {
        const client = await ApolloClient.get('managers')
        let query = gql`
            query managerByEmail($managerEmail: String!) {
                managerByEmail(managerEmail: $managerEmail) {
                    id
                    email
                    firstName
                    lastName
                }
            }
        `
        const result = await client.query({
            query,
            variables: {
                managerEmail
            },
            fetchPolicy: 'no-cache', // we shouldn't cache this query
            context: {
                headers: {
                    Secret: await Config.get('api.managers.secret')
                }
            }
        })
        let queryName = query.definitions[0].name.value
        if (!result.data[queryName]) {
            return 0
        }
        return result.data[queryName]
    }

}
module.exports = Manager