const { Sequelize } = require("sequelize");

module.exports = new Sequelize("mathgame", "root", "", {
  dialect: "mysql",
  port: "3306",
  host: "localhost",
});
