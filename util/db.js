const Sequelize = require("sequelize");
const { DATABASE_URL, TEST_DATABASE_URL } = require("./config");

const url = process.env.TESTING === "true" ? TEST_DATABASE_URL : DATABASE_URL;

const isLocalDatabase =
  url && (url.includes("localhost") || url.includes("127.0.0.1"));

const sequelize = new Sequelize(url, {
  dialectOptions: isLocalDatabase
    ? {}
    : {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("connected to the database");
  } catch (err) {
    console.log("failed to connect to the database");
    return process.exit(1);
  }

  return null;
};

module.exports = { connectToDatabase, sequelize };
