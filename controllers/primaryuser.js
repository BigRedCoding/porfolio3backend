const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/primaryuser");

const { JWT_SECRET } = require("../utils/config");

const HttpError = require("../utils/errors");

const { v4: uuidv4 } = require("uuid");
const dayjs = require("dayjs");

const transporter = require("../utils/emailing");

require("dotenv").config();

const createUser = (req, res, next) => {
    console.log(req.body);
    const { name, password, email, phone, avatar, company } = req.body;
    const date = Date.now();

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
                        email,
                        password: hashedPassword,
                        phone,
                        avatar,
                        company,
                        isVerified: false,
                        verificationCode: "",
                        codeExpires: date,
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
                    console.log(createUserError);
                    const errorMessage = createUserError.message;
                    return next(

                        HttpError.ServerError(`An error has occurred on the server: ${errorMessage}`)
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

const loginWith2FAInit = async (req, res, next) => {
    console.log(req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return next(HttpError.BadRequestError("Email and password are required"));
    }

    try {
        const user = await User.findUserByCredentials(email, password);

        const code = uuidv4().split("-")[0];
        const expires = dayjs().add(5, "minute").toDate();

        user.code = code;
        user.codeExpires = expires;
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Your login verification code",
            text: `Your 2FA code is: ${code}. It expires in 5 minutes.`,
        });

        res.status(200).send({
            message: "Verification code sent to email",
            userId: user._id,
        });
    } catch (error) {
        if (error.message === "Invalid credentials") {
            return next(HttpError.UnauthorizedError("Invalid email or password"));
        }
        console.log(error);
        const errorMessage = error.message;
        return next(HttpError.ServerError(`An error has occurred on the server: ${errorMessage}`));
    }
};

const verifyLogin2FA = async (req, res, next) => {
    console.log(req.body);

    const { email, code } = req.body;

    if (!email || !code) {
        return next(HttpError.BadRequestError("Email and code are required"));
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(HttpError.UnauthorizedError("User not found"));
        }

        if (user.codeExpires < new Date()) {
            return next(HttpError.UnauthorizedError("Verification code expired"));
        }

        if (user.code !== code) {
            return next(HttpError.UnauthorizedError("Invalid verification code"));
        }

        // Clear 2FA data
        user.verificationCode = undefined;
        user.codeExpires = undefined;
        await user.save();

        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
            expiresIn: "7d",
        });

        const userInfo = {
            userEmail: user.email,
            userName: user.name,
            userPhone: user.phone,
            userAvatar: user.avatar,
            userCompany: user.company,
            userId: user._id,
        };

        return res.status(200).send({
            message: "Login successful",
            token,
            userInfo,
        });
    } catch (err) {
        return next(HttpError.ServerError("An error has occurred on the server"));
    }
};

const updateUserProfile = async (req, res, next) => {
    //fix
    const { name, email, phone, company, avatar } = req.body;

    return User.findByIdAndUpdate(
        req.user._id,
        { name, email, phone, company, avatar },
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

const updateUserPassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    User.findById(req.user._id).select('+password')
        .then((user) => {
            if (!user) {
                return next(HttpError.NotFoundError("User not found"));
            }

            return bcrypt.compare(oldPassword, user.password)
                .then((isMatch) => {
                    if (!isMatch) {
                        return next(HttpError.BadRequestError("Old password is incorrect"));
                    }

                    return bcrypt.hash(newPassword, 10);
                })
                .then((hashedPassword) => {
                    user.password = hashedPassword;
                    return user.save();
                })
                .then(() => {
                    return res.status(200).send({ message: "Password updated successfully" });
                });

        })
        .catch((error) => {
            console.log(error);
            const errorMessage = error.message;
            return next(HttpError.ServerError(`An error has occurred on the server: ${errorMessage}`));
        });
};



module.exports = {
    createUser,
    getCurrentUser,
    loginWith2FAInit,
    verifyLogin2FA,
    updateUserProfile,
    updateUserPassword,
};
