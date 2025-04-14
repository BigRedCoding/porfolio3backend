require("dotenv").config();

const cors = require("cors");

const express = require("express");

process.env = require("dotenv").config();

const mongoose = require("mongoose");

const { PORT = 3001 } = process.env;

const rateLimiter = require("./utils/ratelimiter");

const app = express();

const { errors } = require("celebrate");

const errorHandler = require("./middlewares/error-handler");

const { requestLogger, errorLogger } = require("./middlewares/logger");

const { HttpError } = require("./utils/errors");

const mainRouter = require("./routes/index");

const corsOptions = {
  origin(origin, callback) {
    if (
      origin === "https://www.bigredcoding.com/" ||
      origin === "https://api.bigredcoding.com/"
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

mongoose.connect("mongodb://127.0.0.1:27017/NewsExplorer_db").catch(() => {
  throw new HttpError.ServerError("An error has occurred on the server");
});

app.use(express.json());

app.use("/projects/", rateLimiter, mainRouter);

app.listen(PORT);

console.log(`Server will run on port: ${PORT}`);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);
