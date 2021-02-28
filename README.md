# nodebird-api

## JWT 토큰으로 인증하기 (Json Web Token)
[JWT 공식문서](https://www.npmjs.com/package/jsonwebtoken)
- HEADER: 토큰 종류와 해시 알고리즘 정보가 들어있음
- PAYLOAD: 토큰의 내용물이 인코딩된 부분
- SIGNATURE: 일련의 문자열, 시그니처를 통해 토큰이 변조되었는지 여부 확인  
(시그니처는 JWT 비밀 키로 만들어지기 때문에 비밀 키를 철처히 숨겨야 함)
> https://jwt.io

JWT 토큰의 단점은 용량이 크다는 것.  
(내용물이 들어 있으므로 랜덤한 토큰을 사용할때와 비교해서 용량이 큼)  
매 요청 시 토큰이 오고 가서 데이터양이 증가함

```console
$ npm i jsonwebtoken
```

## JWT 토큰으로 로그인

> 세션을 사용하지 않고 로그인 가능  
로그인 완료 시 세션에 데이터를 저장하고 세션 쿠키를 발급하는 대신 JWT 토큰을 쿠키로 발급
- authenticate 메서드의 두번째 인수로 옵션을 주면 세션을 사용하지 않을 수 있음
```javascript
..
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', { session: false }, (authError, user, info) => {
        if(authError) {
..
```
> 세션에 데이터를 저장하지 않으므로 serializeUser, deserializeUser 사용하지 않음  
그 후 모든 라우터에 verifyToken 미들웨어를 넣어  
클라이언트에서 보낸 쿠키를 검사 한 후 토큰이 유효하면 라우터로 넘어가고,  
그렇지 않으면 401, 419 에러를 응답

> 사용자 권한 확인을 위해 데이터베이스를 사용하지 않으므로 데이터베이스 부담을 줄일 수 있음

# 사용량 제한 구현하기
```console
$ npm i express-rate-limit
```