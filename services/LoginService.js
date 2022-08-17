const {ApolloClient, gql} = require('genesis-libs')

class LoginService {
    async login (login, password) {
        const query = gql`
            query login (
                $login: String!
                $password: String!
            ){
                login (
                    login:$login
                    password:$password
                ){
                    idToken
                    refreshToken 
                }
            }
          `
        let result = await (await ApolloClient.get('login')).query({
            query: query,
            variables: {
                login: login,
                password: password
            }
        })
        let action = query.definitions[0].name.value
        return Object.assign({}, result.data[action])
    }
}

module.exports = LoginService