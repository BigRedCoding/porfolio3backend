const mongoose = require("mongoose");

const Pledge = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 40,
  },
});

module.exports = mongoose.model("pledge", Pledge);
