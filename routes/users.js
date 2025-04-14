const router = require("express").Router();
const auth = require("../middlewares/auth");
const { getCurrentUser, updateUserProfile } = require("../controllers/users");
const { validateUpdateUserInfo } = require("../middlewares/validation");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, validateUpdateUserInfo, updateUserProfile);
module.exports = router;
