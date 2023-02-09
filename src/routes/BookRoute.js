const express = require("express");
const router = express.Router();

const { getAllBooks } = require("../controllers/BookController");
const { validateSchema } = require("../middlewares/CommonMiddlewarejs");
const { getBooksValidation } = require("../validators/BookValidator");

const baseUrl = "/books";

router.get(
  "/",
  getBooksValidation,
  validateSchema,
  getAllBooks
);

module.exports = { baseUrl, router };
