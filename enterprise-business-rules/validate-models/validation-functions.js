
const { InvalidPropertyError } = require("../../interface-adapters/config/validators-errors/errors");
const bcrypt = require("bcrypt");



/**
* Validates the format of an email address.
*
* @param {string} email - The email address to validate.
* @return {boolean} Indicates whether the email address is in a valid format.
*/
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    if (!re.test(String(email).toLowerCase())){
        throw new InvalidPropertyError(" Invalid Email ")
    } ;

    return email;
}

/**
 * Validates the name and replaces any '<' characters with '&lt;'.
 *
 * @param {string} name - The name to be validated.
 * @throws {InvalidPropertyError} If the name is less than 2 characters long.
 * @return {string} The validated name with '<' characters replaced, or 'No Name' if the name is falsy.
 */
function validateName(name) {
    if (name.length < 2) {
        throw new InvalidPropertyError(
            `A user's name must be at least 2 characters long.`
        )
    }

    return name.replace(/</g, "&lt;") || "No Name";
}

/**
 * Validates a phone number.
 *
 * @param {string} phone - The phone number to validate.
 * @throws {InvalidPropertyError} If the phone number is invalid.
 */
function validatePhone(phone) {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3})$/;

    // TODO : optimize phone number validation
    if (!phoneRegex.test(phone) || phone.length < 11) {
        throw new InvalidPropertyError(`A user's phone number is not valid.`);
    }
    
    return phone;
}

/**
 * Normalizes user data by capitalizing the first letter of first and last names, and converting email to lowercase.
 *
 * @param {string} firstName - The first name of the user.
 * @param {string} lastName - The last name of the user.
 * @param {string} email - The email address of the user.
 * @param {...Object} otherInfo - Additional user information.
 * @return {Object} The normalized user data.
 */
function normalise({ firstName, lastName, email, ...otherInfo }) {
    return {
        ...otherInfo,
        firstName: firstName.charAt(0).toUpperCase()+ firstName.slice(1),
        lastName: lastName.charAt(0).toUpperCase()+ lastName.slice(1),
        email: email.toLowerCase()
    }
}


async function validatePassword(password) {
    if (password.length < 8) {
        throw new InvalidPropertyError(
            `A user's password must be at least 8 characters long.`
        )
    }
    const hashPw = await bcrypt.hash(password, 10); //generate salt and encrypt
    return hashPw;
}

/**
 * Validates user data by calling individual validation functions for each field.
 *
 * @param {Object} userData - An object containing the user's data.
 * @param {string} userData.firstName - The user's first name.
 * @param {string} userData.lastName - The user's last name.
 * @param {string} userData.email - The user's email address.
 * @param {string} userData.mobile - The user's mobile number.
 * @param {string} userData.password - The user's password.
 * @return {Object} An object containing the validation results for each field.
 * - firstName: The result of validating the first name.
 * - lastName: The result of validating the last name.
 * - email: The result of validating the email address.
 * - mobile: The result of validating the mobile number.
 * - password: The result of validating the password.
 */
async function validateUserData({
    firstName,
    lastName,
    email,
    mobile,
    password
}) {

    if (!firstName && !lastName) {
        return res.status(400).json({ msg: 'user  must have at least one name.' })
    }

    if (!email) {
        return res.status(400).json({ msg: 'user must have an email.' })
    }

    if (!password) {
        return res.status(400).json({ msg: 'user must have a password.' })
    }

    return {
        email: validateEmail(email),
        mobile: validatePhone(mobile),
        password: await validatePassword(password),
        firstName: validateName(firstName),
        lastName: validateName(lastName),
    };
}



module.exports = {validateUserData, normalise};