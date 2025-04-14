const articles = require("../models/articles.js");
const HttpError = require("../utils/errors");

const addArticle = (req, res, next) => {
  const {
    author,
    title,
    description,
    imageUrl,
    url,
    source,
    date,
    favorites,
    likes,
    keywords,
  } = req.body;

  articles
    .create({
      author,
      title,
      description,
      imageUrl,
      url,
      source,
      date,
      favorites,
      likes,
      keywords,
    })
    .then(() => {
      res.status(201).send({
        message: "Article added successfully",
      });
    })

    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(
          HttpError.BadRequestError("Articles schema validation error")
        );
      }
      return next(HttpError.ServerError());
    });
};

const getAllArticles = (req, res, next) => {
  articles
    .find()
    .then((articles) => {
      res.status(200).send({ data: articles });
    })
    .catch(() => {
      return next(
        HttpError.ServerError("An error occurred while retrieving articles")
      );
    });
};
const checkAndAddArticleWithLikes = (req, res, next) => {
  articles
    .findOne({ _id: req.body._id })
    .then((existingArticle) => {
      if (existingArticle) {
        if (existingArticle.likes.includes(req.user._id)) {
          return;
        }
        existingArticle.likes.push(req.user._id);
        return existingArticle.save().then((updatedArticle) => {
          res.status(200).send({ data: updatedArticle });
        });
      }
      if (!existingArticle) {
        let {
          author,
          title,
          description,
          imageUrl,
          url,
          source,
          date,
          favorites = [],
          likes = [],
          keywords,
        } = req.body;

        likes = [req.user._id];

        req.body = {
          author,
          title,
          description,
          imageUrl,
          url,
          source,
          date,
          favorites,
          likes,
          keywords,
        };

        return addArticle(req, res, next);
      }
    })
    .catch(() => {
      let {
        author,
        title,
        description,
        imageUrl,
        url,
        source,
        date,
        favorites = [],
        likes = [],
        keywords,
      } = req.body;

      likes = [req.user._id];

      req.body = {
        author,
        title,
        description,
        imageUrl,
        url,
        source,
        date,
        favorites,
        likes,
        keywords,
      };

      return addArticle(req, res, next);
    });
};

const checkAndAddArticleWithFavorite = (req, res, next) => {
  articles
    .findOne({ _id: req.body._id })
    .then((existingArticle) => {
      if (existingArticle) {
        if (existingArticle.favorites.includes(req.user._id)) {
          return;
        }
        existingArticle.favorites.push(req.user._id);
        return existingArticle.save().then((updatedArticle) => {
          res.status(200).send({ data: updatedArticle });
        });
      }
      if (!existingArticle) {
        let {
          author,
          title,
          description,
          imageUrl,
          url,
          source,
          date,
          favorites = [],
          likes = [],
          keywords,
        } = req.body;

        favorites = [req.user._id];

        req.body = {
          author,
          title,
          description,
          imageUrl,
          url,
          source,
          date,
          favorites,
          likes,
          keywords,
        };
        return addArticle(req, res, next);
      }
    })
    .catch(() => {
      let {
        author,
        title,
        description,
        imageUrl,
        url,
        source,
        date,
        favorites = [],
        likes = [],
        keywords,
      } = req.body;

      favorites = [req.user._id];

      req.body = {
        author,
        title,
        description,
        imageUrl,
        url,
        source,
        date,
        favorites,
        likes,
        keywords,
      };

      return addArticle(req, res, next);
    });
};
const checkAndRemoveArticleByLikes = (req, res, next) => {
  articles
    .findOne({ _id: req.body._id })
    .then((existingArticle) => {
      if (!existingArticle) {
        return next(HttpError.NotFoundError("Article not found"));
      }

      if (existingArticle.likes.includes(req.user._id)) {
        existingArticle.likes.pull(req.user._id);

        if (
          existingArticle.favorites.length < 1 &&
          existingArticle.likes.length < 1
        ) {
          return articles.findByIdAndDelete(req.body._id).then(() => {
            res.status(200).send({
              message: "Article successfully removed",
            });
          });
        }

        return existingArticle.save().then(() => {
          res.status(200).send({
            message: "Article like removed",
          });
        });
      } else {
        return next(
          HttpError.BadRequestError("User has not liked this article")
        );
      }
    })
    .catch(next);
};

const checkAndRemoveArticleByFavorites = (req, res, next) => {
  articles
    .findOne({ _id: req.body._id })
    .then((existingArticle) => {
      if (!existingArticle) {
        return next(HttpError.NotFoundError("Article not found"));
      }

      if (existingArticle.favorites.includes(req.user._id)) {
        existingArticle.favorites.pull(req.user._id);

        if (
          existingArticle.favorites.length < 1 &&
          existingArticle.likes.length < 1
        ) {
          return articles.findByIdAndDelete(req.body._id).then(() => {
            res.status(200).send({
              message: "Article successfully removed",
            });
          });
        }

        return existingArticle.save().then(() => {
          res.status(200).send({
            message: "Article like removed",
          });
        });
      } else {
        return next(
          HttpError.BadRequestError("User has not liked this article")
        );
      }
    })
    .catch(next);
};

module.exports = {
  getAllArticles,
  checkAndAddArticleWithLikes,
  checkAndAddArticleWithFavorite,
  checkAndRemoveArticleByLikes,
  checkAndRemoveArticleByFavorites,
};
