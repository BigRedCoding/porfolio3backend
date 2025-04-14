const router = require("express").Router();
const articles = require("./articles");
const userRouter = require("./users");
const pledge = require("./pledge");
const clothingItems = require("./clothingItems");

const { login, createUser } = require("../controllers/users");

const {
  validateAuthentication,
  validateUserInfo,
} = require("../middlewares/validation");

router.use("/v1/articles", articles);
router.use("/v1/users", userRouter);
router.use("/v1/pledges", pledge);
router.use("/v1/items", clothingItems);


router.post("/v1/signin", validateAuthentication, login);
router.post("/v1/signup", validateUserInfo, createUser);

module.exports = router;
