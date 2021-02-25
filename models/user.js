const Sequelize = require('sequelize');

module.exports = class  User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: true,
                unique: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            provider: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'local',  // local: 로컬로그인, kakao: 카카오로그인
            },
            snsId: {
                type: Sequelize.STRING(30),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: false,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    
    static associate(db) {
        db.User.hasMany(db.Post);  // 1 (User) : N (Post) 
        // N (User) : M (User) - 팔로잉 기능
        db.User.belongsToMany(db.User, {
            foreignKey: 'followingId',
            as: 'Followers',    // foreignKey 와 반대되는 모델을 가리킨다 (같은 테이블끼리의 N:M 관계일때 필수)
            through: 'Follow',  // through: 생성할 모델 이름
        });
        // Follow 모델 생성 (followerId | followingId 정보를 가짐)
        db.User.belongsToMany(db.User, {
            foreignKey: 'followerId',
            as: 'Followings',   // foreignKey 와 반대되는 모델을 가리킨다 (같은 테이블끼리의 N:M 관계일때 필수)
            through: 'Follow',  // through: 생성할 모델 이름
        });

        // 1 (User) : N (Domain)
        db.User.hasMany(db.Domain);
    }
};