// joi lets you describe your data using a simple, intuitive, and readable language.
// For more info: https://joi.dev/api
const BaseJoi = require("joi");
// sanitize-html provides a simple HTML sanitizer with a clear API.
// For more info: https://www.npmjs.com/package/sanitize-html
const sanitizeHtml = require("sanitize-html");

const Joi = BaseJoi.extend((joi) => {
  return {
    type: "string",
    base: joi.string(),
    messages: {
      "string.escapeHTML": "{{#label}} must not include HTML",
    },
    rules: {
      escapeHTML: {
        validate(value, helper) {
          const clean = sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {},
          });
          if (clean !== value)
            return helper.error("string.escapeHTML", { value });
          return clean;
        },
      },
    },
  };
});

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    location: Joi.string().required().escapeHTML(),
    // image: Joi.string().required(),
    description: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(0).max(5),
    body: Joi.string().required().escapeHTML(),
  }).required(),
});

module.exports.userSchema = Joi.object({
  username: Joi.string().alphanum().required().escapeHTML(),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
  password: Joi.string().pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/
  ),
  repeat_password: Joi.valid(Joi.ref("password")).required(),
}).required();
