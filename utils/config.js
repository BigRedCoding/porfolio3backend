const { JWT_SECRET } =
  process.env.NODE_ENV === "production"
    ? process.env
    : { JWT_SECRET: "123456789" };

module.exports = { JWT_SECRET };
