const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/config");

const HttpError = require("../utils/errors");

const auth = (req, res, next) => {
  const { authorization } = req.headers || "";

  if (!authorization) {
    return next(
      HttpError.UnauthorizedError("Authorization header is required")
    );
  }

  const token = authorization.replace("Bearer ", "");

  try {
    if (!token) {
      return next(HttpError.UnauthorizedError("Token is missing"));
    }

    if (!JWT_SECRET) {
      return next(HttpError.ServerError("JWT Secret is missing"));
    }

    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;

    return next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(HttpError.UnauthorizedError("Invalid or malformed token"));
    }
    if (err.name === "TokenExpiredError") {
      return next(HttpError.UnauthorizedError("Token has expired"));
    }

    if (err.name === "ServerError") {
      return next(
        HttpError.ServerError("An unexpected error occurred on the server")
      );
    }

    return next(HttpError.ServerError("An unknown error occurred"));
  }
};

module.exports = auth;
