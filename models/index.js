const Blog = require("./blog");
const User = require("./user");
const ReadingList = require("./readingList");
const Session = require("./session");

User.hasMany(Blog);
Blog.belongsTo(User);

User.belongsToMany(Blog, { through: ReadingList, as: "readings" });
Blog.belongsToMany(User, { through: ReadingList, as: "readers" });

User.hasMany(ReadingList);
Blog.hasMany(ReadingList);
ReadingList.belongsTo(User);
ReadingList.belongsTo(Blog);

User.hasMany(Session);
Session.belongsTo(User);

module.exports = {
  Blog,
  User,
  ReadingList,
  Session,
};
