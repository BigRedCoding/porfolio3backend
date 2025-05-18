const mongoose = require("mongoose");

const validator = require("validator");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "The name field is required"],
        minlength: 2,
        maxlength: 30,
    },
    email: {
        type: String,
        required: [true, "The email field is required"],
        unique: true,
        validate: {
            validator(value) {
                return validator.isEmail(value);
            },
            message: "Invalid email format",
        },
    },
    password: {
        type: String,
        required: [true, "The password field is required"],
        select: false,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    },
    avatar: {
        type: String,
        required: [false],
    },
    company: {
        type: String,
        default: "",
    },
    isVerified: { type: Boolean, default: false },
    code: String,
    codeExpires: Date,
});

userSchema.statics.findUserByCredentials = function checkEmailPassword(
    email,
    password
) {
    return this.findOne({ email })
        .select("+password")
        .then((user) => {
            if (!user) {
                return Promise.reject(new Error("Invalid credentials"));
            }

            return bcrypt.compare(password, user.password).then((isMatch) => {
                if (!isMatch) {
                    return Promise.reject(new Error("Invalid credentials"));
                }
                return user;
            });
        });
};

module.exports = mongoose.model("primaryuser", userSchema);