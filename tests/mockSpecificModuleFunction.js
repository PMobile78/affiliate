function getFullName(firstName, lastName) {
    return firstName + ' ' + lastName
}
function greet(firstName, lastName) {
    const fullName = exportFunctions.getFullName(firstName, lastName);
    return `Hey, ${fullName}`
}

const exportFunctions = {
    getFullName,
    greet
}
exports.exportFunctions = exportFunctions