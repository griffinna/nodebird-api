const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

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
            expiresIn: '1m',    // 유효기간: 1분 (zeit/ms (https://github.com/zeit/ms) 형식)
            // expiresIn: 60 * 1000
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
router.get('/test', verifyToken, (req, res) => {
    res.json(req.decoded);
});

// 내가 작성한 포스트
router.get('/posts/my', verifyToken, (req, res) => {
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

router.get('/posts/hashtag/:title', verifyToken, async (req, res) => {
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

module.exports = router;