const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email }});
        if(exUser) {
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if(authError) {
            console.error(authError);
            return next(authError);
        }
        if(!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if(loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next) 를 붙인다.
});

router.get('/logout', isLoggedIn, (req, res, next) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

// 카카오 로그인 라우터
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백 라우터
router.get('/kakao/callback', passport.authenticate('kakao', {
    // 로컬과 다르게 passport.authenticate 메서드에 콜백 함수 제공하지 않음 (내부적으로 req.login 을 호출)
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;