module.exports = (config) => {
    config.sqs.deleteCognitoTokens = {
        queueUrl: `/sqs/deleteCognitoTokens/queueUrl`,
        region: 'us-east-1',
        messageGroupId: 'cognito-tokens'
    }

    config.sqs.zendeskAffiliateStatus = {
        queueUrl: `/sqs/zendeskAffiliateStatus/queueUrl`,
        region: 'us-east-1',
        messageGroupId: 'zendeskAffiliateStatus'
    }

    config.sqs.zendeskAffiliateCreate = {
        queueUrl: `/sqs/zendeskAffiliateCreate/queueUrl`,
        region: 'us-east-1',
        messageGroupId: 'zendeskAffiliateCreate'
    }

    config.sqs.hyuna = {
        queueUrl: `/sqs/hyuna/queueUrl`,
        region: 'us-east-1',
        messageGroupId: 'hyuna'
    }

    config.sqs.sales = {
        queueUrl: `/sqs/sales/queueUrl`,
        region: 'us-east-1',
        messageGroupId: 'sales'
    }

    config.sqs.affiliate = {
        queueUrl: `/sqs/affiliate/queueUrl`,
        region: 'us-east-1',
        messageGroupId: 'affiliate'
    }

    config.sqs.whitelist = {
        queueUrl: `/sqs/whitelist/queueUrl`,
        region: 'us-east-1',
        messageGroupId: 'whitelist'
    }

    config.cognito = {
        UserPoolId: `/cognito/userPoolId`,
        ClientId: `/cognito/clientId`
    }

    config.passwordEncryption = {
        enabled: true,
        key: `/passwordEncryption/key`
    }

    config.customEvent.fields = {
        triggerSource: 'static',
        entityType: 'static',
        eventType: 'static',
        Records: 'complex'
    }

    config.api.email = {
        url: '/api/email/url',
        secret: '/api/email/secret',
    }

    config.api.tokenSecret = {
        url: `/api/tokenSecret/url`,
        secret: `/api/tokenSecret/secret`,
    }

    config.api.managers = {
        url: '/api/managers/url',
        secret: '/api/managers/secret',
    }

    config.api.paymentMethod = {
        url: '/api/paymentMethod/url',
        secret: '/api/paymentMethod/secret',
    }

    config.api.login = {
        url: `/api/login/url`
    }

    config.api.history = {
        url: '/api/history/url'
    }

    config.acl.affiliate = [
        'affiliateStatus',
        'affiliate',
        'affiliates',
        'setAppConfig',
        'getAppConfig',
        'updateTrackTermsStatus',
        'updateAcceptionTermsStatus'
    ]
    config.acl['affiliate/active'] = [
        'updateAffiliate',
        'updateAffiliateEmailToken',
        'zendeskToken',
        'legacyAuthToken',
        'updatePassword',
        'createAffiliateEmail',
    ]

    config.acl['affiliate/impersonated'] = [
        'updateAffiliate',
        'updateAffiliateEmailToken',
        'zendeskToken',
        'legacyAuthToken',
        'updatePassword',
        'createAffiliateEmail',
    ]

    config.acl.internalUser = [
        'affiliateByEmail',
        'affiliateStatusById',
        'updateAffiliateEmailTokenSecret',
        'confirmAffiliateEmail',
        'createAffiliate',
        'affiliateByIDSecret',
        'affiliatesByIdsSecret',
        'applyNewEmail',
        'affiliateByActiveEmail',
    ]

    config.zendesk = {
        enabled: true,
        key: `/zendesk/key`
    }

    config.api.legacy = {
        key: `/api/legacy/key`
    }

    config.deniedUpdate = {
        interval: `/deniedUpdate/interval`,
        title: 'month'
    }

    config.rabbitMQ = {
        enabled: process.env.useRabbitMQ || false,
        url: {
            hostname: `/rabbit/host`,
            port: 5672,
            username: `/rabbit/username`,
            password: `/rabbit/password`,
        },
        exchangeName: `/rabbit/exchange`,
        exchangeType: 'topic',
        routingKey: 'create-from-genesis',
        terms: {
            exchangeName: `/rabbit/termsExchange`,
            routingKey: 'terms-genesis',
        }
    }

    config.api.hyuna = {
        host: `/api/hyuna/host`,
        secret: `/api/hyuna/secret`,
        enabled: process.env.useHyuna || false,
    }

    config.terms = {
        version: 3
    }

    //loginStartDate month/day/year
    config.signUpStartDate = "06/04/2021" //June 04

    return config
}