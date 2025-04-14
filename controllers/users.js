const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/user");

const { JWT_SECRET } = require("../utils/config");

const HttpError = require("../utils/errors");

const createUser = (req, res, next) => {
  const { name, password, email, avatar } = req.body;

  if (!email || !password) {
    return next(HttpError.BadRequestError("Email and password are required"));
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(HttpError.ConflictError("This email is not available"));
      }

      return new Promise((resolve, reject) => {
        bcrypt.hash(password, 8, (err, hashedPassword) => {
          if (err) {
            return reject(HttpError.ServerError("Error hashing the password"));
          }
          return resolve(hashedPassword);
        });
      })
        .then((hashedPassword) =>
          User.create({
            name,
            password: hashedPassword,
            email,
            avatar,
          })
        )
        .then((newUser) => {
          res
            .status(201)
            .json({ message: "User created successfully", user: newUser });
        })
        .catch((createUserError) => {
          if (createUserError.name === "ValidationError") {
            return next(HttpError.BadRequestError("Invalid data provided"));
          }

          if (createUserError.name === "CastError") {
            return next(HttpError.BadRequestError("Invalid ID"));
          }

          return next(
            HttpError.ServerError("An error has occurred on the server")
          );
        });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail()
    .then((user) => {
      if (!user) {
        return next(HttpError.NotFoundError("User not found"));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return next(HttpError.NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(HttpError.BadRequestError("User not found"));
      }

      return next(HttpError.ServerError("An error has occurred on the server"));
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(HttpError.BadRequestError("Email and password are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      const userInfo = {
        userEmail: user.email,
        userName: user.name,
        userAvatar: user.avatar,
        userId: user._id,
      };
      return res
        .status(200)
        .send({ message: "Login successful", token, userInfo });
    })
    .catch((error) => {
      if (error.message === "Invalid credentials") {
        return next(HttpError.UnauthorizedError("Invalid email or password"));
      }
      return next(HttpError.ServerError("An error has occurred on the server"));
    });
};

const updateUserProfile = (req, res, next) => {
  const { name, avatar } = req.body;

  return User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) {
        return next(HttpError.NotFoundError("User not found"));
      }
      return res.status(200).send(user);
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        return next(HttpError.BadRequestError("Invalid data provided"));
      }
      return next(HttpError.ServerError("An error has occurred on the server"));
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateUserProfile,
};
