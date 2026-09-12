const bcrypt = require("bcryptjs");
const router = require("express").Router();

const { User, Blog } = require("../models");
const { tokenExtractor, isAdmin } = require("../util/middleware");

router.post("/", async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    if (!password || password.length < 3) {
      return res
        .status(400)
        .json({ error: "password must be at least 3 characters long" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ username, name, passwordHash });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["passwordHash"] },
    include: {
      model: Blog,
      attributes: { exclude: ["userId"] },
    },
  });
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const throughOptions = { attributes: ["read", "id"] };

  if (req.query.read !== undefined) {
    throughOptions.where = { read: req.query.read === "true" };
  }

  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ["passwordHash"] },
    include: {
      model: Blog,
      as: "readings",
      attributes: { exclude: ["userId"] },
      required: false,
      through: throughOptions,
    },
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

router.put("/:username", async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    });
    if (!user) {
      return res.status(404).end();
    }
    user.name = req.body.name;
    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:username/disabled",
  tokenExtractor,
  isAdmin,
  async (req, res, next) => {
    try {
      const user = await User.findOne({
        where: { username: req.params.username },
      });
      if (!user) {
        return res.status(404).end();
      }
      user.disabled = req.body.disabled;
      await user.save();
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
