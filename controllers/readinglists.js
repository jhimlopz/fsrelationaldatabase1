const router = require("express").Router();

const { Blog, User, ReadingList } = require("../models");
const { tokenExtractor } = require("../util/middleware");

router.post("/", async (req, res, next) => {
  try {
    const { blogId, userId } = req.body;

    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return res
        .status(400)
        .json({ error: "blogId does not refer to an existing blog" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(400)
        .json({ error: "userId does not refer to an existing user" });
    }

    const readingListEntry = await ReadingList.create({ blogId, userId });
    res.status(201).json(readingListEntry);
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
      return res
        .status(403)
        .json({
          error: "you can only mark blogs in your own reading list as read",
        });
    }

    entry.read = req.body.read;
    await entry.save();
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
