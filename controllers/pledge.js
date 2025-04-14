const Pledge = require("../models/pledge.js");

const HttpError = require("../utils/errors");

const createPledge = (req, res, next) => {
  const { description } = req.body;

  Pledge.create({
    description,
  })
    .then((item) => {
      res.status(201).send({ data: item });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(HttpError.BadRequestError());
      }
      return next(HttpError.ServerError());
    });
};

const getPledges = (req, res, next) => {
  Pledge.find()
    .then((items) => res.status(200).send({ data: items }))
    .catch(() => next(HttpError.ServerError()));
};

const deletePledges = (req, res, next) => {
  Pledge.deleteMany()
    .then(() => {
      res.status(200).send({ message: "All pledges deleted successfully" });
    })
    .catch(() => {
      next(HttpError.ServerError());
    });
};

module.exports = {
  createPledge,
  getPledges,
  deletePledges,
};
