const {gql} = require('genesis-libs')

module.exports = gql`
    extend type Query {
        legacyAuthToken: String!
    }
`