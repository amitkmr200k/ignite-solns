const express = require("express");
const router = express.Router();

const {validationResult} = require('express-validator');

const { getAllBooks } = require("../controllers/BookController");
const { getBooksValidation } = require("../validators/BookValidator");

const baseUrl = "/books";

router.get("/", getBooksValidation, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ messgage: "Validation Error", errors: errors.array() });
    }

    next();
  }, getAllBooks);

module.exports = {baseUrl, router };
