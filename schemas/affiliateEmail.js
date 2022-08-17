const {gql} = require('genesis-libs')

module.exports = gql` 
     extend type Mutation {
          createAffiliateEmail(
               email: String!,
               fingerprint: String
          ): Email!
          
          confirmAffiliateEmail( 
               tokenId: ID!,
               affiliateId: ID!
          ): Email!
          
          updateAffiliateEmailTokenSecret(
               affiliateId: ID!
               email: String!
               tokenId: ID!
          ): Email!
          
          applyNewEmail(
               tokenId: ID!,
               affiliateId: ID!,
               fingerprint: String,
               sourceIp:String
          ): Email!
     } 
     type Email {
          email: String!,
          isVerified: Boolean!
          isActive: Boolean!
     }
     `