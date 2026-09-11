const { Model, DataTypes } = require("sequelize");

const { sequelize } = require("../util/db");

class Blog extends Model {}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    author: {
      type: DataTypes.TEXT,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    year: {
      type: DataTypes.INTEGER,
      validate: {
        isValidYear(value) {
          if (value === null || value === undefined) {
            return;
          }
          const currentYear = new Date().getFullYear();
          if (!Number.isInteger(value) || value < 1991 || value > currentYear) {
            throw new Error(
              `year must be an integer between 1991 and ${currentYear}`,
            );
          }
        },
      },
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: "blog",
  },
);

module.exports = Blog;
