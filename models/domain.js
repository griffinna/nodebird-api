const Sequelize = require('sequelize');
const { associate } = require('./user');

module.exports = class Domain extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            host: {
                type: Sequelize.STRING(80),
                allowNull: false,
            },
            type: {
                type: Sequelize.ENUM('free', 'premium'),    // Enum: 넣을 수 있는 값을 제한
                allowNull: false,
            },
            clientSecret: {
                type: Sequelize.UUID,   // UUID: 충돌 가능성이 매우 적은 랜덤 문자열
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            modelName: 'Domain',
            tableName: 'domains',
        });
    }

    static associate(db) {
        db.Domain.belongsTo(db.User);
    }
};