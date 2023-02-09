const { checkSchema } = require("express-validator");

const getBooksValidation = checkSchema({
  page: {
    in: ["query"],
    optional: true,
    isInt: true,
    toInt: true,
  },
});

module.exports = { getBooksValidation };
