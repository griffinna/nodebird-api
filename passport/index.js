const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
    // .serializeUser : 로그인시 실행 (req.session 객체에 어떤 데이터를 저장할지 정함)
    // 사용자 정보 객체를 세션에 아이디로 저장 (세션에 불필요한 정보를 담지않기 위해 아이디만 저장)
    passport.serializeUser((user, done) => {
        // done(에러, 저장할 데이터);
        done(null, user.id);
    });

    // .deserializeUser : 매 요청 시 실행 (passport.session 미들웨어가 이 메서드를 호출)
    // 세션에 저장한 아이디를 통해 사용자정보 객체를 불러오는 것
    passport.deserializeUser((id, done) => {    // done의 두번째 인수로 넣은 데이터가 매개변수가 됨
        User.findOne({  // 사용자 정보 조회할 때 팔로잉, 팔로워 목록도 함께 조회
            where: {id},
            include: [{
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followers',
            }, {
                model: User,
                attributes: ['id', 'nick'],
                as: 'Followings'
            }],
        })
            .then(user => done(null, user)) // req.user 에 저장
            .catch(err => done(err));
    });

    local();
    kakao();
}