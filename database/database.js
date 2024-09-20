const Sequelize = require("sequelize");

const connection = new Sequelize("gb_ier_id8ju","gb_ier_id8ju","LS-T29ymR3MR", {
    host: "mysql105.1gb.ru",
    dialect: "mysql",
    dialectOptions: {
        // Your pg options here
      },
    logging: false
})

module.exports = connection;