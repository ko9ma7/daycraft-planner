# DayCraft 생활계획표 스튜디오

[![Deploy GitHub Pages](https://github.com/ko9ma7/daycraft-planner/actions/workflows/deploy.yml/badge.svg)](https://github.com/ko9ma7/daycraft-planner/actions/workflows/deploy.yml)

**Live Demo:** https://ko9ma7.github.io/daycraft-planner/  
**Repository:** https://github.com/ko9ma7/daycraft-planner

아이들이 직접 일정과 시간을 입력하고, 디자인·아이콘·스티커를 꾸민 뒤 **PNG / JPG / WebP / SVG / PDF / 인쇄**로 내보내거나 **편집 가능한 링크**로 공유할 수 있는 GitHub Pages용 정적 웹서비스입니다.

기존 `계획표.html`의 일정 추가·수정·삭제, 원형 생활계획표, CSV, LocalStorage 기능을 유지하면서 편집기형 UI로 다시 설계했습니다.

## Windows 원클릭 GitHub 배포

압축을 푼 프로젝트 폴더에서 **`배포하기.cmd`를 더블클릭**하면 다음 작업을 자동으로 처리합니다.

1. Git / GitHub CLI가 없으면 Windows `winget`으로 설치
2. GitHub CLI 로그인 상태 확인 (`gh auth login --web`)
3. `daycraft-planner` 공개 저장소가 없으면 생성
4. 프로젝트 전체를 `main` 브랜치에 커밋하고 push
5. Repository About의 설명 / Website / Topics 설정
6. GitHub Pages를 `GitHub Actions` 방식으로 활성화
7. `.github/workflows/deploy.yml` 실행 및 완료 여부 확인
8. 저장소와 실제 Pages 주소를 브라우저로 열기

이미 저장소가 존재해도 재실행할 수 있습니다. 기존 원격 저장소에 충돌하는 이력이 있을 경우에는 **강제 push하지 않고 중단**하므로 실수로 내용을 덮어쓰지 않습니다.

기본 배포 목표:

```text
Repository:   https://github.com/ko9ma7/daycraft-planner
GitHub Pages: https://ko9ma7.github.io/daycraft-planner/
```

배포가 끝나면 프로젝트 루트에 `DEPLOY_RESULT.txt`가 생성됩니다.

## Preview

![Desktop preview](screenshots/desktop.png)

모바일에서는 미리보기를 크게 유지하고, 하단 도구 버튼으로 편집 패널을 열어 사용합니다.

<img src="screenshots/mobile.png" width="320" alt="DayCraft mobile preview">

## Features

- 일정 추가 / 수정 / 삭제 / 복제
- `매일` 또는 월~일 다중 요일 지정
- 자정 넘김 일정 지원 (예: 22:00 - 07:00)
- 동일 요일 시간 중복 검사
- 3개 출력 레이아웃: 원형 시계 / 타임라인 / 카드 보드
- 8개 디자인 프리셋: 컬러 팝 / 공책 / 클레이 / 글래스 / 미니멀 / 별밤 / 레트로 / 숲속
- 제목, 부제, 강조색, 시간 눈금, 상세설명, 범례 설정
- 내장 SVG 아이콘과 드래그 가능한 스티커
- 사용자 SVG 파일 / SVG 코드 가져오기 (위험 요소를 제거한 제한적 SVG만 허용)
- 자동 저장 + 새로고침 후 마지막 작업 복원
- 실행 취소 / 다시 실행 (Ctrl/Cmd+Z, Ctrl/Cmd+Y)
- 기존 `summerVacationSchedules` LocalStorage 데이터 자동 마이그레이션
- 프로젝트 JSON 백업/복원
- CSV 내보내기/불러오기
- PNG / JPG / WebP / SVG / PDF 저장
- 브라우저 인쇄
- 현재 편집 상태를 URL에 압축해 넣는 편집 가능한 공유 링크
- Light / Dark / System 화면 테마
- PWA 기본 구성 및 핵심 파일 오프라인 캐시
- 반응형 UI (모바일 / 태블릿 / 데스크톱)
- GitHub Pages Actions 자동 배포
- favicon / app icon / Apple Touch Icon / OG image / Social Preview / 404 / robots / sitemap

## 공유 링크 방식

GitHub Pages는 정적 호스팅이라 데이터베이스가 없습니다. DayCraft는 편집 상태를 URL의 `#share=` 부분에 압축하여 넣습니다.

1. `공유` 버튼을 누릅니다.
2. 링크를 복사하거나 기기 공유 기능을 사용합니다.
3. 받은 사람이 링크를 열면 같은 계획표가 로드됩니다.
4. 받은 사람은 자유롭게 수정하고 다시 새 링크를 만들 수 있습니다.

이 방식은 **실시간 공동 편집**이 아니라 **편집 가능한 복사본 공유**입니다. 일정/사용자 SVG가 너무 많으면 링크가 길어질 수 있으므로 JSON 백업도 함께 사용할 수 있습니다.

## 아이콘과 Koboyo

Koboyo Icons는 일반 웹/문서 안에서 사용하는 것은 허용하지만, 아이콘을 사용자가 골라 추출·내보낼 수 있는 편집기나 아이콘 라이브러리에 아이콘 묶음을 내장하는 것은 라이선스상 제한됩니다. 따라서 DayCraft에는 자체 제작한 단순 SVG 아이콘을 넣고, 사용자가 합법적으로 확보한 SVG를 **직접 가져오기**로 추가할 수 있게 했습니다.

Koboyo: https://koboyo.com/icons

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript ES6+
- SVG 기반 렌더러 (별도 차트 라이브러리 없음)
- Canvas API (PNG/JPG/WebP)
- 브라우저 Blob API
- 자체 JPEG-in-PDF writer (외부 PDF 라이브러리 없음)
- LocalStorage
- Service Worker / Cache Storage
- GitHub Actions + GitHub Pages

런타임 dependency가 없어 초기 로딩과 GitHub Pages 배포가 단순합니다.

## Project Structure

```text
/
├─ src/
│  ├─ assets/
│  │  ├─ favicon.svg
│  │  ├─ favicon-32.png
│  │  ├─ apple-touch-icon.png
│  │  ├─ icon-192.png
│  │  ├─ icon-512.png
│  │  ├─ og-image.png
│  │  └─ social-preview.png
│  ├─ css/app.css
│  ├─ js/
│  │  ├─ app.js
│  │  └─ icons.js
│  ├─ 404.html
│  ├─ index.html
│  ├─ manifest.webmanifest
│  ├─ robots.txt
│  ├─ sitemap.xml
│  ├─ sw.js
│  └─ .nojekyll
├─ scripts/
│  ├─ build.mjs
│  └─ dev.mjs
├─ screenshots/
├─ .github/workflows/deploy.yml
├─ scripts/deploy-github.ps1
├─ 배포하기.cmd
├─ .gitignore
├─ GITHUB_SETUP.md
├─ package.json
├─ LICENSE
└─ README.md
```

## Local Development

Node.js 20+가 필요합니다. 외부 npm 패키지는 없습니다.

```bash
npm run dev
```

기본 주소:

```text
http://127.0.0.1:4173/
```

## Build

```bash
npm run build
```

결과는 `dist/`에 생성됩니다.

전체 정적 검사와 빌드:

```bash
npm run check
```

## GitHub Pages Deployment

### 권장: Windows 원클릭 배포

프로젝트 루트의 `배포하기.cmd`를 더블클릭합니다. 최초 1회 GitHub 로그인이 필요하면 GitHub CLI가 공식 브라우저 인증 화면을 엽니다. 로그인 후 나머지는 자동으로 진행됩니다.

### 수동 배포

원클릭 스크립트를 사용하지 않는 경우 아래처럼 직접 배포할 수 있습니다.

```bash
git init
git add .
git commit -m "feat: launch DayCraft planner studio"
git branch -M main
gh repo create ko9ma7/daycraft-planner --public --source=. --remote=origin --push
```

Repository About 설정:

```bash
gh repo edit ko9ma7/daycraft-planner \
  --description "아이들이 직접 만들고 꾸미고 공유하는 생활계획표 스튜디오" \
  --homepage "https://ko9ma7.github.io/daycraft-planner/" \
  --add-topic kids --add-topic planner --add-topic schedule \
  --add-topic education --add-topic github-pages --add-topic pwa
```

Pages를 GitHub Actions 방식으로 활성화:

```bash
gh api --method POST repos/ko9ma7/daycraft-planner/pages -f build_type=workflow
```

이미 Pages가 존재하면 `POST` 대신 다음 명령으로 설정을 갱신할 수 있습니다.

```bash
gh api --method PUT repos/ko9ma7/daycraft-planner/pages -f build_type=workflow
```

`.github/workflows/deploy.yml`이 포함되어 있으므로 이후에는 `main`에 push할 때마다 자동으로 빌드·배포됩니다. `build.mjs`가 GitHub Actions의 `GITHUB_REPOSITORY`를 읽어 canonical, Open Graph URL, sitemap URL을 실제 저장소 경로에 맞게 생성합니다.

배포 주소:

```text
https://ko9ma7.github.io/daycraft-planner/
```

## Configuration

주요 설정은 `src/js/app.js` 상단에서 관리합니다.

- `CANVAS_SIZES`: 출력 비율/해상도
- `PRESETS`: 디자인 프리셋
- `QUICK_ACTIVITIES`: 빠른 일정 템플릿
- `src/js/icons.js`: 내장 SVG 아이콘

디자인 토큰과 앱 UI는 `src/css/app.css`의 `:root`에서 수정할 수 있습니다.

## Custom Domain

커스텀 도메인을 연결할 때는 `src/CNAME` 파일을 만들고 도메인만 한 줄로 적습니다.

```text
planner.example.com
```

그리고 GitHub의 `Settings → Pages → Custom domain`에서도 같은 도메인을 설정하고 HTTPS를 활성화하세요.

OG/canonical URL도 커스텀 도메인으로 고정하려면 GitHub Actions 빌드 단계에 환경 변수를 추가합니다.

```yaml
- run: npm run build
  env:
    SITE_URL: https://planner.example.com/
```

## Security / Privacy

- 일정 데이터는 기본적으로 현재 브라우저 LocalStorage에만 저장됩니다.
- 공유 버튼을 누를 때만 현재 상태가 링크에 포함됩니다.
- API key, 비밀번호, 토큰은 사용하지 않습니다.
- 사용자 SVG는 `script`, 이벤트 핸들러, 외부 URL 등을 허용하지 않는 제한적 화이트리스트 방식으로 정리합니다.
- 공유 링크에는 입력한 일정 내용이 포함되므로 개인정보나 민감한 정보를 넣지 않는 것을 권장합니다.

## Browser Support

최근 Chrome / Edge / Safari / Firefox를 목표로 합니다. 공유 링크 압축은 `CompressionStream`이 있으면 gzip을 사용하고, 없으면 비압축 JSON URL로 자동 대체합니다.

## License

프로젝트 코드는 MIT License입니다. 내장 아이콘은 이 프로젝트를 위해 직접 구성한 단순 SVG 도형입니다.

