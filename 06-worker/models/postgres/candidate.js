const Sequelize = require('sequelize');

const sequelize = require('../../connection').sequelize;

const Candidate = sequelize.define('candidate', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    party: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    currentVotes: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    pictureId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

module.exports = Candidate;