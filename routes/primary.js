const router = require("express").Router();
const userRouter = require("./primaryuser");

const functionRoute = require("./functions");

const { loginWith2FAInit, verifyLogin2FA, createUser } = require("../controllers/primaryuser");

const {
    validateAuthenticationPrimary,
    validateUserInfoPrimary,
} = require("../middlewares/primaryvalidation");

router.use("/v1/users", userRouter);

router.post("/v1/signin", validateAuthenticationPrimary, loginWith2FAInit);

router.post("/v1/verify", verifyLogin2FA)

router.post("/v1/signup", validateUserInfoPrimary, createUser);

router.use("/v1/functions", functionRoute);

module.exports = router;