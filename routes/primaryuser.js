const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
    getCurrentUser,
    updateUserProfile,
    updateUserPassword,
} = require("../controllers/primaryuser");
const { validateUpdateUserInfoPrimary, validateUpdatePassword } = require("../middlewares/primaryvalidation");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, validateUpdateUserInfoPrimary, updateUserProfile);
router.patch("/me/update-password", auth, validateUpdatePassword, updateUserPassword);

module.exports = router;

