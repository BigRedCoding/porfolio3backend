require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const { PORT = 3001 } = process.env;

const rateLimiter = require("./utils/ratelimiter");
const { errors } = require("celebrate");
const errorHandler = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");
const { HttpError } = require("./utils/errors");

const mainRouter = require("./routes/index");
const primaryRouter = require("./routes/primary");

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (
      origin === "https://bigredcoding.rit.cl" ||
      origin === "https://www.bigredcoding.rit.cl" ||
      origin === "https://api.bigredcoding.rit.cl" ||
      origin === "https://projects.bigredcoding.rit.cl" ||
      origin === "https://projects.bigredcoding.rit.cl/FinalProject" ||
      origin === "https://projects.bigredcoding.rit.cl/WTWR" ||
      origin === "https://projects.bigredcoding.rit.cl/PlanetPledge"
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"), false);
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
};

const corsPolicy =
  process.env.NODE_ENV === "production" ? cors(corsOptions) : cors();

app.use(corsPolicy);

app.use(rateLimiter);
app.use(requestLogger);

mongoose
  .connect("mongodb://127.0.0.1:27017/1066843f2099e10caeb65d8e4165805e")
  .catch(() => {
    throw new HttpError.ServerError("An error has occurred on the server");
  });

app.use(express.json());

app.use("/projects", rateLimiter, mainRouter);
app.use("/primary", rateLimiter, primaryRouter);

app.listen(PORT, () => {
  console.log(`Server will run on port: ${PORT}`);
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
