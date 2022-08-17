const SignUp = require('../../../../../../services/SignUp')

module.exports = async (event) => {
    const serviceSignUp = new SignUp()
    await serviceSignUp.signUp(
        event.entity.email,
        event.entity.password,
        event.entity.first_name,
        event.entity.last_name,
        event.entity.affiliate_type,
        event.entity.id
    )
    return event
}