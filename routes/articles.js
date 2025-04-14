const router = require("express").Router();

const auth = require("../middlewares/auth");

const {
  getAllArticles,
  checkAndAddArticleWithLikes,
  checkAndAddArticleWithFavorite,
  checkAndRemoveArticleByLikes,
  checkAndRemoveArticleByFavorites,
} = require("../controllers/articles");

router.post("/articles-with-likes", auth, checkAndAddArticleWithLikes);
router.post("/articles-with-favorites", auth, checkAndAddArticleWithFavorite);

router.get("/get-all-articles", getAllArticles);

router.delete("/articles-with-likes", auth, checkAndRemoveArticleByLikes);
router.delete(
  "/articles-with-favorites",
  auth,
  checkAndRemoveArticleByFavorites
);

module.exports = router;
