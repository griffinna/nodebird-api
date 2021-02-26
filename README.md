# nodebird-api

## JWT 토큰으로 인증하기 (Json Web Token)
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