# 배너 생성기

힐오(Healio) 사내 배너 자동 생성 도구. Tailwind CSS 기반 단일 페이지 웹앱.

## 파일 구조

```
banner-generator/
├── index.html           # 메인 페이지 (Tailwind utility-first)
├── main.js              # 입력/미리보기/다운로드 로직
├── tailwind.css         # 빌드된 Tailwind 결과 (커밋해서 배포)
├── tailwind.config.js   # 디자인 토큰 정의 (brand / hgray 등)
├── src/
│   └── input.css        # Tailwind directives + 디자인 시스템 layers
└── package.json         # npm scripts
```

## 빌드 / 개발

```bash
# 의존성 설치 (최초 1회)
npm install

# 프로덕션 빌드 (tailwind.css 갱신)
npm run build

# 개발 (watch 모드 — input.css/index.html 변경 시 자동 재빌드)
npm run dev
```

`index.html`이나 `main.js`에서 새 Tailwind 클래스를 사용한 뒤에는 반드시 `npm run build`를 실행해 `tailwind.css`를 갱신해야 합니다.

## 사용

`index.html`을 브라우저에서 열면 바로 동작합니다. 별도 서버 불필요.

## 디자인 토큰

`tailwind.config.js`에서 관리합니다.

- **브랜드 컬러**: `bg-brand`, `text-brand-500`, `border-brand-400`(highlight) 등
- **그레이**: `text-hgray-900`, `bg-hgray-100`, `border-hgray-300`
- **폰트**: `font-suit` (SUIT 한글 폰트)
- **그림자**: `shadow-card`, `shadow-card-preview`

## 핵심 동작

- 좌측 미리보기 패널은 데스크탑에서 `lg:sticky lg:top-10`로 고정
- 화면 폭 1056px 이하면 `flex-wrap`으로 세로 배치 자동 전환
- Focus highlight는 JS에서 inline style로 토글 (CSS 셀렉터 체인 제거)
- 배너 내부는 `container-type: inline-size` + `cqi`로 자동 비례 스케일
