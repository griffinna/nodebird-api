// 라우터에 접근 권한을 제어하는 미들웨어
const jwt = require('jsonwebtoken');
const RateLimit = require('express-rate-limit');

exports.isLoggedIn = (req, res, next) => {
    // Passport 는 req 객체에 isAuthenticated 메서드를 추가함 (로그인중이라면 true, 아니면 false)
    if(req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('로그인 필요');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
};

exports.verifyToken = (req, res, next) => {
    try {
        // 토큰검증 : jwt.verify(토큰, 토큰의 비밀번호);
        req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        if(error.name === 'TokenExpiredError') {    // 유효기간 초과
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.',
            });
        }
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.',
        });
    }
};

exports.apiLimiter = new RateLimit({
    windowMs: 60 * 1000,    // 1분  (기준시간)
    max: 10,                 // 허용 횟수
    delayMs: 0,             // 호출 간격
    handler(req, res) {     // 제한 초과 시 콜백 함수
        res.status(this.statusCode).json({
            code: this.statusCode,  // 기본값 429
            message: '1분에 한 번만 요청할 수 있습니다.',
        });
    },
});

exports.deprecated = (req, res) => {
    res.status(410).json({
        code: 410,
        message: '새로운 버전을 사용하세요.',
    });
};