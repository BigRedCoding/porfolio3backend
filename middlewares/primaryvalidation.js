const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

const urlCheckPrimary = (value, helpers) => {
    if (value === null || value === undefined) {
        return "";
    }
    if (value === "") {
        return value;
    }

    if (validator.isURL(value)) {
        return value;
    }

    return helpers.error("string.uri");
};

const validateEmailPrimary = (value, helpers) => {
    if (validator.isEmail(value)) {
        return value;
    }
    return helpers.error("string.email");
};

const validateUserInfoPrimary = celebrate({
    body: Joi.object().keys({
        name: Joi.string().min(2).max(30).required().messages({
            "string.min": 'The "name" must be at least 2 characters long',
            "string.max": 'The "name" must be no longer than 30 characters',
            "string.empty": 'The "name" field must be filled in',
        }),
        email: Joi.string().required().custom(validateEmailPrimary).messages({
            "string.empty": 'The "email" field must be filled in',
            "string.email": 'The "email" must be a valid email address',
        }),
        password: Joi.string().required().messages({
            "string.empty": 'The "password" field must be filled in',
        }),
        phone: Joi.string()

            .required()
            .messages({
                "string.pattern.base": 'Please enter a valid phone number',
                "string.empty": 'The "phone" field must be filled in',
            }),
        avatar: Joi.string()
            .custom(urlCheckPrimary)
            .allow("")
            .messages({
                "string.uri": 'The "avatar" field must be a valid URL',
            }),
        company: Joi.string().allow("").messages({
            "string.base": 'The "company" must be a string',
        }),
    }),
});


const validateAuthenticationPrimary = celebrate({
    body: Joi.object().keys({
        email: Joi.string().required().custom(validateEmailPrimary).messages({
            "string.empty": 'The "email" field must be filled in',
            "string.email": 'The "email" must be a valid email address',
        }),
        password: Joi.string().required().messages({
            "string.empty": 'The "password" field must be filled in',
        }),
    }),
});

const validateUpdateUserInfoPrimary = celebrate({
    body: Joi.object().keys({
        name: Joi.string().min(2).max(30).required().messages({
            "string.min": 'The "name" must be at least 2 characters long',
            "string.max": 'The "name" must be no longer than 30 characters',
            "string.empty": 'The "name" field must be filled in',
        }),

        avatar: Joi.string().allow("").custom(urlCheckPrimary).messages({
            "string.uri": 'The "avatar" field must be a valid URL',
        }),

        company: Joi.string().allow("").messages({
            "string.base": 'The "company" must be a string',
        }),

        email: Joi.string().email().required().messages({
            "string.email": 'The "email" must be a valid email address',
            "string.empty": 'The "email" field must be filled in',
        }),

        phone: Joi.string().pattern(/^\d{10}$/).required().messages({
            "string.pattern.base": 'The "phone" must be a 10-digit number',
            "string.empty": 'The "phone" field must be filled in',
        }),
    }),
});


const validateIdPrimary = celebrate({
    params: Joi.object().keys({
        itemId: Joi.string().length(24).hex().required().messages({
            "string.length": "Item ID must be 24 characters long",
            "string.hex": "Item ID must be a valid hexadecimal string",
        }),
    }),
});

const validateUpdatePassword = celebrate({
    body: Joi.object().keys({
        oldPassword: Joi.string().required().messages({
            'string.empty': 'Old password is required',
        }),
        newPassword: Joi.string().min(2).required().messages({
            'string.empty': 'New password is required',
            'string.min': 'New password must be at least 2 characters long',
        }),
    }),
});

module.exports = {
    validateUserInfoPrimary,
    validateAuthenticationPrimary,
    validateIdPrimary,
    validateUpdateUserInfoPrimary,
    validateUpdatePassword,
};