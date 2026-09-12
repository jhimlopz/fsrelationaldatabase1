const jwt = require("jsonwebtoken");
const { SECRET } = require("./config");
const { User, Session } = require("../models");

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    const token = authorization.substring(7);

    try {
      req.decodedToken = jwt.verify(token, SECRET);
    } catch {
      return res.status(401).json({ error: "token invalid" });
    }

    const session = await Session.findOne({ where: { token } });
    if (!session) {
      return res
        .status(401)
        .json({ error: "session expired, please log in again" });
    }

    req.token = token;
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

const isAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id);
  if (!user || !user.admin) {
    return res.status(401).json({ error: "operation not allowed" });
  }
  next();
};

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (
    error.name === "SequelizeValidationError" ||
    error.name === "SequelizeUniqueConstraintError"
  ) {
    return res.status(400).json({ error: error.errors.map((e) => e.message) });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "invalid token" });
  }

  next(error);
};

module.exports = { errorHandler, tokenExtractor, isAdmin };
