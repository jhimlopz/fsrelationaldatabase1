const router = require("express").Router();
const { Op } = require("sequelize");

const { Blog, User } = require("../models");
const { tokenExtractor } = require("../util/middleware");

router.get("/", async (req, res) => {
  const search = `%${req.query.search}%`;
  const where = {};

  if (req.query.search) {
    where[Op.or] = [
      {
        title: {
          [Op.iLike]: search,
        },
      },
      {
        author: {
          [Op.iLike]: search,
        },
      },
    ];
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name"],
    },
    where,
    order: [["likes", "DESC"]],
  });
  res.json(blogs);
});

router.post("/", tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    if (!user) {
      return res.status(400).json({ error: "invalid user" });
    }
    const blog = await Blog.create({ ...req.body, userId: user.id });
    res.json(blog);
  } catch (error) {
    next(error);
  }
});

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  if (!req.blog) {
    return res.status(404).end();
  }
  next();
};

router.get("/:id", blogFinder, async (req, res) => {
  res.json(req.blog);
});

router.delete("/:id", tokenExtractor, blogFinder, async (req, res) => {
  if (req.blog.userId !== req.decodedToken.id) {
    return res
      .status(403)
      .json({ error: "only the creator can delete this blog" });
  }
  await req.blog.destroy();
  res.status(204).end();
});

router.put("/:id", blogFinder, async (req, res, next) => {
  try {
    req.blog.likes = req.body.likes;
    await req.blog.save();
    res.json(req.blog);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
