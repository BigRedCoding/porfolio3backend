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

const allowedOrigins = [
  "https://www.bigredcoding.com",
  "https://api.bigredcoding.com",
  "https://wtwr.bigredcoding.com",
  "https://planetpledge.bigredcoding.com",
  "https://finalproject.bigredcoding.com",
  "https://securitydemo.bigredcoding.com",
];

// CORS options with explicit origin checking and credentials
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin like curl or Postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed from this origin"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
  ],
};

// Apply CORS middleware globally
app.use(cors(corsOptions));
app.options("*", cors(corsOptions), (req, res) => {
  res.sendStatus(204);
});

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
