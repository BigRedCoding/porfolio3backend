const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

const urlCheck = (value, helpers) => {
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

const validateEmail = (value, helpers) => {
  if (validator.isEmail(value)) {
    return value;
  }
  return helpers.error("string.email");
};

const validateClothingItem = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required().messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),

    imageUrl: Joi.string().required().custom(urlCheck).messages({
      "string.empty": 'The "image URL" field must be filled in',
      "string.uri": 'The "image URL" field must be a valid URL',
    }),
    weather: Joi.string().valid("hot", "warm", "cold").required().messages({
      "string.empty": 'The "weather" field must be filled in',
    }),
  }),
});

const validateUserInfo = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required().messages({
      "string.min": 'The "name" must be at least 2 characters long',
      "string.max": 'The "name" must be no longer than 30 characters',
      "string.empty": 'The "name" field must be filled in',
    }),
    avatar: Joi.string().custom(urlCheck).allow("").required().messages({
      "string.uri": 'The "avatar" field must be a valid URL',
    }),

    email: Joi.string().required().custom(validateEmail).messages({
      "string.empty": 'The "email" field must be filled in',
      "string.email": 'The "email" must be a valid email address',
    }),
    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in',
    }),
  }),
});

const validateAuthentication = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom(validateEmail).messages({
      "string.empty": 'The "email" field must be filled in',
      "string.email": 'The "email" must be a valid email address',
    }),
    password: Joi.string().required().messages({
      "string.empty": 'The "password" field must be filled in',
    }),
  }),
});

const validateUpdateUserInfo = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required().messages({
      "string.min": 'The "name" must be at least 2 characters long',
      "string.max": 'The "name" must be no longer than 30 characters',
      "string.empty": 'The "name" field must be filled in',
    }),
    avatar: Joi.string().allow("").required().custom(urlCheck).messages({
      "string.empty": 'The "avatar" field must be filled in',
      "string.uri": 'The "avatar" field must be a valid URL',
    }),
  }),
});

const validateId = celebrate({
  params: Joi.object().keys({
    itemId: Joi.string().length(24).hex().required().messages({
      "string.length": "Item ID must be 24 characters long",
      "string.hex": "Item ID must be a valid hexadecimal string",
    }),
  }),
});

module.exports = {
  validateClothingItem,
  validateUserInfo,
  validateAuthentication,
  validateId,
  validateUpdateUserInfo,
};