require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");

const { notFound, handleError } = require("./src/middlewares/CommonMiddlewarejs");
const apiRoutes = require("./src/routes/index");

app.use(cors());
app.use(helmet());

app.use(express.json());

app.use("/api", apiRoutes);

app.get("/", (request, response, next) => {
  response.send("Welcome to Ignitie Solutions Assignment");
});

app.use(notFound);
app.use(handleError);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`igniate-assignment backend is listening on port ${process.env.SERVER_PORT}!`);
});
