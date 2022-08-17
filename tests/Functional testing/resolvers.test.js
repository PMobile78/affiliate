const config = require('../../ConfigManager')
const {gql} = require('apollo-server-lambda')
const apollo = require('../../ApolloClient')

describe('Functional testing', () => {
    it('getAffiliateByEmail', async () => {
        // let {secret} = await config.get('api.affiliate')
        // const getAffiliateByEmail = gql`
        //     query getAffiliateByEmail($login: String!, $secret: String!){
        //           getAffiliateByEmail(email: $login, secret: $secret){
        //             id,
        //             emails {
        //               email,
        //               isVerified
        //             },
        //             password,
        //             firstName,
        //             lastName,
        //             createdDate
        //           }
        //         }
        //   `
        // let result = await (await apollo.get('affiliate')).query({
        //     query: getAffiliateByEmail,
        //     variables: {
        //         login: 'test1@test.com',
        //         secret: secret
        //     }
        // })
        // console.log(result.data.getAffiliateByEmail)
    })
})