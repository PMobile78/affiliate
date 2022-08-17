const {Config} = require('genesis-libs')
const Rijndael = require('rijndael-js')

class Password {
    async decryptPassword (encryptedPassword) {
        let {enabled, key} = await Config.get('passwordEncryption')
        if (!enabled) {
            return encryptedPassword
        }
        let cipher = new Rijndael(key, 'ecb')
        let passwordInBuffer = Buffer.from(encryptedPassword, 'base64')
        let decryptedPassword = Buffer.from(cipher.decrypt(passwordInBuffer, 256))
        return decryptedPassword.toString('utf8').replace(/\0/g, '')
    }

    async encryptPassword (originalPassword) {
        let {key, enabled} = await Config.get('passwordEncryption')
        if (!enabled) {
            return originalPassword
        }
        let cipher = new Rijndael(key, 'ecb')
        let ciphertext = Buffer.from(cipher.encrypt(originalPassword, 256))
        return ciphertext.toString('base64')
    }
}

module.exports = Password