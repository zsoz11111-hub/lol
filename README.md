# 서진성 · 김성은 롤 콘셉트 모바일 청첩장

2026년 11월 15일 일요일 낮 12시 · 글로리아 웨딩홀 3층 비스타홀

## 1. GitHub에 올리기

**이 폴더 안의 파일과 폴더를 모두 저장소 최상위에 업로드하세요.** 저장소를 열었을 때 `index.html`이 바로 보여야 합니다. ZIP 자체를 올리는 것이 아니라 압축을 푼 내용을 올립니다.

별도 설치나 빌드가 필요 없는 HTML/CSS/JavaScript 사이트입니다. `node_modules`, 미리보기 코드, 원본 사진 폴더는 필요하지 않습니다.

```text
index.html                 시작 화면
css/style.css              전체 화면 스타일
js/app.js                  로그인·로비·랜덤 팀·CS 게임
js/details.js              연락처·계좌·갤러리·지도·음악
js/assets.js               사진·음악 파일 경로
js/config.js               기존 Firebase 프로젝트 연결 설정
js/storage.js              공유 접속 기록·하객 순위
assets/photos/             웨딩사진 9장·초상화·약도
assets/champions/           상대팀 25명과 하객 아이콘
assets/audio/              전체 길이 BGM·매칭 효과음
vendor/                    Firebase 실행 파일
database.rules.json        공유 기록 저장 권한 설정
firebase.json              Firebase 규칙 파일 지정
netlify.toml               Netlify 정적 사이트 설정
.nojekyll                  GitHub Pages용 파일
```

## 2. 공개 주소 만들기

### 기존 Netlify에 연결

- GitHub 저장소를 연결하고 배포 브랜치를 선택합니다.
- Base directory: 비움
- Build command: 비움
- Publish directory: `.`
- 기존 `1115wedding.netlify.app` 사이트에 연결하면 기존 주소가 이 롤 청첩장으로 바뀝니다. 다른 사이트에 연결하면 새 주소로 공개됩니다.

### GitHub Pages

저장소의 Settings → Pages → Deploy from a branch에서 업로드한 브랜치와 `/ (root)`를 선택합니다. 모든 정적 파일 경로는 상대경로라 저장소 하위 주소에서도 동작합니다.

공유 대표 사진은 `index.html`의 `og:image`입니다. 최종 배포 주소를 확인한 뒤 `./assets/photos/wedding0.webp`를 `https://배포주소/assets/photos/wedding0.webp`로 바꾸면 공유 서비스의 미리보기 호환성이 좋아집니다.

## 3. 접속 기록·전체 하객 순위: 최초 1회 설정

**화면·사진·음악·게임은 업로드만으로 동작합니다. 다른 하객과 접속 기록·순위를 공유하려면 아래 Firebase 설정이 필요합니다.**

기존 `lol-main`에 있던 `lolwedding` 프로젝트 설정을 `js/config.js`에 넣었습니다. 실제 계정 비밀번호를 입력하는 로그인이 아니라 닉네임 입장이며, Firebase는 내부적으로 익명 인증을 사용합니다.

1. [Firebase 콘솔](https://console.firebase.google.com/project/lolwedding/overview)에 프로젝트 소유자 계정으로 로그인합니다.
2. Authentication → Sign-in method → **Anonymous(익명)**를 사용 설정합니다.
3. Authentication → Settings → Authorized domains에서 최종 배포 도메인을 확인하고 필요하면 추가합니다.
4. Realtime Database → Rules에서 기존 규칙을 백업한 뒤 `database.rules.json`의 규칙을 적용합니다.
5. 배포 주소에서 닉네임으로 입장해 로비에 **접속 기록이 저장되었습니다**가 나오는지 확인합니다.
6. 20초 게임을 완료하고 다른 기기에서도 순위가 보이는지 확인합니다.

이 규칙 파일은 `lol_wedding_v2`만 허용합니다. 같은 Firebase 프로젝트에서 다른 앱을 운영 중이라면 기존 규칙을 통째로 덮지 말고 이 노드의 규칙을 병합하세요. 상위의 `.read: true` / `.write: true`가 있으면 하위 제한이 무효가 되므로 공개 루트 권한도 정리해야 합니다. 이 작업물은 원격 Firebase 설정이나 데이터를 변경하지 않았습니다.

- 새 기록은 `lol_wedding_v2/visits`와 `lol_wedding_v2/scores`에 저장합니다. 예전 `wedding_lobby_logs`, `wedding_minigame_scores`는 삭제하거나 가져오지 않습니다.
- 같은 브라우저의 익명 사용자별로 최근 방문과 최고 점수를 유지합니다. 닉네임만 같고 기기가 다르면 별도 사용자입니다.
- 최근 접속 30건 중 마지막 6건, 점수 상위 20개 중 상위 5명을 화면에 표시합니다.
- 기록 연결이 안 되어도 청첩장과 게임은 열리며, 저장 실패 문구와 이번 방문의 게임 기록을 표시합니다. 공유 저장 성공으로 가장하지 않습니다.
- 화면의 점수는 재미용입니다. 클라이언트 점수 입력의 범위를 규칙으로 검증하지만 부정행위를 완전히 차단하는 서버 판정 방식은 아닙니다.

공식 설정 참고: [익명 인증](https://firebase.google.com/docs/auth/web/anonymous-auth), [Realtime Database 규칙](https://firebase.google.com/docs/database/security).

## 포함된 기능

- 닉네임·아이콘 선택 → 매칭 수락 → 웨딩 로비
- 우리팀 웨딩사진, 상대팀 라인별 5명 중 랜덤 1명
- 메뉴를 보고 돌아올 때 상대팀 유지
- 웨딩사진 9장, 확대·스와이프
- 초대 문구·양가 부모님·일정 추가·한국 시간 기준 D-day
- 기존 청첩장의 약도·네이버/카카오 지도·주소 복사
- 신랑·신부·혼주 전화와 문자 링크
- 양가 6개 계좌와 복사, 복사가 제한된 환경의 수동 복사
- BGM 약 2분 27초 전체 반복, 매칭 효과음 약 5초, 음소거·게임 중 음량 조절
- 20초 CS 게임, 실제 점수 결과, `ㅉㅁ?` 재도전, `청첩장으로` 로비 복귀
- 탭을 벗어나면 게임 중단·안내 화면 복귀, 음악 일시정지
- 닉네임·아이콘·음소거 선택은 해당 기기에만 기억
- 축하 메시지·방명록 기능 없음

## 확인된 실제 정보와 남은 내용

- 신랑 아버님 농협 계좌는 사용자 확인에 따라 **302-0815-1234-81**로 표시와 복사 값을 통일했습니다.
- 실제 성함·가족·연락처·계좌·예식장 정보는 기존 `https://1115wedding.netlify.app/` 기준입니다.
- 무료 주차시간과 주차장 입구는 아직 확인되지 않아 확인 후 안내할 내용으로 표시했습니다. 확정되면 `index.html`의 교통·주차 안내를 수정하세요.
- 음악 재생은 로그인·수락 등 사용자가 누른 뒤 시작합니다. 기기나 브라우저가 차단하면 소리 버튼을 껐다 켜서 재시도할 수 있습니다.
- 인터넷 공유 기능은 `file://`로 직접 열기보다 배포된 HTTPS 주소에서 확인하세요.

## 검증 범위

정적 파일 연결, 11개 화면 동선, 사진 9장, 닉네임 처리, 랜덤 팀 유지, 게임 점수·재도전·복귀, 계좌 일치, 연락처·주소, 음소거 상태, Firebase 성공·실패 동작을 자동 검사했습니다. 음악 파일은 디코딩 검사했습니다.

실제 휴대폰 화면·스피커 재생 및 원격 Firebase 권한은 이번 환경에서 직접 검증하지 못했습니다. 배포 후 휴대폰의 카카오톡 안 브라우저와 기본 브라우저에서 한 번 확인해주세요.

## 이미지·라이브러리 출처

- 웨딩사진: 제공된 `261115 서진성.김성은11x15-20P` 폴더에서 선정.
- 약도·예식 정보: 기존 모바일 청첩장.
- 음악: 제공된 `롤/lol-main`의 BGM·효과음. 길이를 자르지 않고 웹 재생용 MP3로 정리.
- 챔피언 초상화: Riot Games Data Dragon 16.17.1.
- Firebase JavaScript SDK: 9.22.1 compat 배포본. 파일 내 라이선스 고지를 유지했습니다. [SDK 소스·라이선스](https://github.com/firebase/firebase-js-sdk/tree/firebase%409.22.1).

이 폴더에는 서비스 계정 비밀키나 관리자 삭제 기능이 없습니다. Firebase 웹 설정의 API 키는 앱 연결용 공개 설정이며, 데이터 접근은 인증과 Database Rules가 제어합니다.
