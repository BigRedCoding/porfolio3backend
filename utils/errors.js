class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }

  static BadRequestError(message) {
    return new HttpError(message, 400);
  }

  static UnauthorizedError(message) {
    return new HttpError(message, 401);
  }

  static ForbiddenError(message) {
    return new HttpError(message, 403);
  }

  static NotFoundError(message) {
    return new HttpError(message, 404);
  }

  static ConflictError(message) {
    return new HttpError(message, 409);
  }

  static ServerError(message) {
    return new HttpError(message, 500);
  }
}

module.exports = HttpError;
