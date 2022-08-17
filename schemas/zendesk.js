const {gql} = require('genesis-libs')

module.exports = gql`
     extend type Query {
          zendeskToken: ZendeskToken!           
     }
     type ZendeskToken {    
          token: String!
     }
     `
