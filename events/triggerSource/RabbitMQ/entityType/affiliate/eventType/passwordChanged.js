const CognitoService = require('../../../../../../services/CognitoService')

module.exports = async (event) => {
    const cognitoService = new CognitoService()
    await cognitoService.changePassword(event.entity.id, event.entity.email, event.entity.password)
    return event
}