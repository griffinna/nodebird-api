const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');

const { verifyToken, apiLimiter } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

// Access-Control-Allow-Origin 헤더가 추가되도록 cors 적용
/*
    router.use(cors({
        credentials: true,      // 다른 도메인 간 쿠키가 공유 (Access-Control-Allow-Credentials: true)
    }));
*/

// 비밀키 발급시 허용한 도메인을 확인하여, 호스트와 비밀키가 모두 일치할 때만 CORS 허용하도록 함
router.use(async (req, res, next) => {
    const domain = await Domain.findOne({
        where: {host: url.parse(req.get('origin')).host },
    });
    if(domain) {
        cors({
            origin: req.get('origin'),
            credentials: true,
        }) (req, res, next);
    } else {
        next();
    }
});

// 토큰 발급 라우터 (POST /v1/token)
router.post('/token', async (req, res) => {
    const { clientSecret } = req.body;
    try {
        const domain = await Domain.findOne({
            where: {clientSecret},
            include: {
                model: User,
                attributes: ['nick', 'id'],
            },
        });
        if(!domain) {
            return res.status(401).json({
                code: 401,
                message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요.',
            });
        }
        // 토큰발급: jwt.sign(토큰의 내용, 토큰의 비밀 키, 토큰의 설정)
        const token = jwt.sign({    
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET, {
            expiresIn: '30m',    // 유효기간: 30분 (zeit/ms (https://github.com/zeit/ms) 형식)
            issuer: 'nodebird', // 발급자
        });
        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다.',
            token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: 'Server Error',
        });
    }
});

// 사용자가 토큰을 테스트해볼 수 있는 라우터 (GET /v1/test)
router.get('/test', verifyToken, apiLimiter, (req, res) => {
    res.json(req.decoded);
});

// 내가 작성한 포스트
router.get('/posts/my', apiLimiter, verifyToken, (req, res) => {
    Post.findAll({ where: { userId: req.decoded.id } })
        .then((posts) => {
            console.log(posts);
            res.json({
                code: 200,
                payload: posts,
            });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({
                code: 500,
                message: 'Server Error!',
            });
        });
});

router.get('/posts/hashtag/:title', verifyToken, apiLimiter, async (req, res) => {
   try {
       const hashtag = await Hashtag.findOne({ where: { title: req.params.title } });
       if(!hashtag) {
           return res.status(404).json({
               code: 404,
               message: '검색 결과가 없습니다.',
           });
       }
       const posts = await hashtag.getPosts();
       return res.json({
           code: 200,
           payload: posts,
       });
   } catch (error) {
       console.error(error);
       return res.status(500).json({
           code: 500,
           message: 'Server Error!',
       });
   }  
});

module.exports = router;