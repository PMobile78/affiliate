// See https://medium.com/@qjli/how-to-mock-specific-module-function-in-jest-715e39a391f4
// How to mock specific module function in jest?

let helpers = require('./mockSpecificModuleFunction')

describe('greet', () => {
    it('should return greet message with full name', () => {
        helpers.exportFunctions.getFullName = jest.fn().mockReturnValue('mock full name')
        const result = helpers.exportFunctions.greet('QJ', 'Li')
        expect(result).toBe('Hey, mock full name')
    })
})