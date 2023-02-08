const express = require("express");
const router = express.Router();

const {baseUrl, router: bookRoute} = require("./BookRoute");

router.use(baseUrl, bookRoute);

module.exports = router;
