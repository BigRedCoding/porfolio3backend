const JWT_SECRET = process.env.SECRET_KEY;

if (!JWT_SECRET) {
  throw new Error("SECRET_KEY environment variable is not set.");
}

module.exports = { JWT_SECRET };
