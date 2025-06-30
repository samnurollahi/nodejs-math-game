const { DataTypes } = require("sequelize")

const sequelize = require("../config/db")

module.exports = sequelize.define("rooms", {
    id: {
        type: DataTypes.UUIDV4,
        defaultValue: DataTypes.UUIDV4,
        allowNull: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        defaultValue: "rooms",
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "labby",
    },
    users: {
        type: DataTypes.JSON,
        defaultValue: '[]',
    }
}, {
    timestamps: true,
    tableName: "rooms",
})