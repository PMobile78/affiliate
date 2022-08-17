const {gql} = require('genesis-libs')

module.exports = gql` 
     extend type Query {      
          affiliate: Affiliate
          affiliateStatus: String
          affiliateByEmail(email: String!): Affiliate
          affiliateByActiveEmail(email: String!): Affiliate
          affiliateStatusById(id: ID!): String
          affiliateByIDSecret(affiliateId: ID!): Affiliate
          affiliates: Affiliates
          affiliatesByIdsSecret(ids: [ID]!, sort:[Sort], filter:Filter, perPage: Int, pageNumber: Int): AffiliatesList
          getAppConfig: appConfig
     }     
     type Mutation {
          updateAffiliate( 
             firstName: String, 
             lastName: String,
             fingerprint: String
          ): Affiliate!
          
          createAffiliate( 
             firstName: String!, 
             lastName: String!,
             email: String!,
             password: String!
          ): Affiliate!
          
          updatePassword (
            oldPassword: String!,
            newPassword: String!,
            confirmPassword: String!
          ): String!
          
          updateAcceptionTermsStatus(status: String!): String
          updateTrackTermsStatus(status: String!): String          
          setAppConfig(config: String!): appConfig
     }
     type AffiliatesList {
         affiliateList:[Affiliate]!,
         nextPage: Int
         previousPage: Int
         count: Int
     } 
     type Affiliate {
          id: ID!, 
          emails: [Email]!,
          firstName: String!,         
          lastName: String!,                 
          createdDate: Int!,
          type: String!,
          status: String!,
          tier: String,
          isSignedUpOnNewLogin: Boolean,
          lastContactDate: Int,
          termStatus: String,
          currentSales: Int,
          previousSales: Int,
          currentUniqVisits: Int,
          previousUniqVisits: Int,
          currentConversionRatio: Float,
          previousConversionRatio: Float,
          comparisonConversionRatio: Float
     }
      type Affiliates {
         id: ID!
         email: String 
         date_added: Int
         first_name: String 
         last_name: String
         country_code: String
         ref_link: String
         status: String
         statusDescription: String
         termStatus: String
     }
     type appConfig {
        config: String
     }
     input Sort {
        field: SortField!
        type: SortOrder!
     }
     enum SortField {
        firstName
        lastName
        status
        createdDate
        tier
        lastContactDate
        comparisonConversionRatio
        currentConversionRatio
     }
     enum SortOrder {
        ASC
        DESC
     }
     input Filter {
       search: String,
       status: AffiliateStatus 
     }
     enum AffiliateStatus {
        active
        inactive
    } 
     `