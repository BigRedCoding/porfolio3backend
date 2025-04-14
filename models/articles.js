const mongoose = require("mongoose");

const validator = require("validator");

const articles = new mongoose.Schema({
  author: {
    type: String,
    required: false,
    default: "",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: "",
  },
  imageUrl: {
    type: String,
    required: false,
    default: "",
    validate: {
      validator: (v) => v === "" || validator.isURL(v),
      message: "The URL is not valid",
    },
  },
  url: {
    type: String,
    required: true,
    default: "",
    validate: {
      validator: (v) => v === "" || validator.isURL(v),
      message: "The URL is not valid",
    },
  },
  source: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  keywords: {
    type: Array,
    default: [],
    required: true,
  },
  favorites: {
    type: Array,
    default: [],
    required: false,
  },
  likes: {
    type: Array,
    default: [],
    required: false,
  },
});

module.exports = mongoose.model("articles", articles);
