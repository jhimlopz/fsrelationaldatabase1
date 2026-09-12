const router = require("express").Router();

const { Blog, User, ReadingList } = require("../models");
const { tokenExtractor } = require("../util/middleware");

const toResponseShape = (entry) => ({
  id: entry.id,
  user_id: entry.userId,
  blog_id: entry.blogId,
  read: entry.read,
});

router.post("/", async (req, res, next) => {
  try {
    const { blogId, userId } = req.body;

    if (blogId === undefined) {
      return res.status(400).json({ error: "blogId is required" });
    }
    if (userId === undefined) {
      return res.status(400).json({ error: "userId is required" });
    }

    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return res
        .status(404)
        .json({ error: "blogId does not refer to an existing blog" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ error: "userId does not refer to an existing user" });
    }

    const existing = await ReadingList.findOne({ where: { blogId, userId } });
    if (existing) {
      return res
        .status(400)
        .json({ error: "this blog is already on that user's reading list" });
    }

    const readingListEntry = await ReadingList.create({ blogId, userId });
    res.status(201).json(toResponseShape(readingListEntry));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", tokenExtractor, async (req, res, next) => {
  try {
    const entry = await ReadingList.findByPk(req.params.id);
    if (!entry) {
      return res.status(404).end();
    }

    if (entry.userId !== req.decodedToken.id) {
      return res.status(401).json({
        error: "you can only mark blogs in your own reading list as read",
      });
    }

    entry.read = req.body.read;
    await entry.save();
    res.json(toResponseShape(entry));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
