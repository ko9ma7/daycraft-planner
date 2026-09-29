# GitHub 저장소 설정값

`배포하기.cmd`가 아래 값을 자동 적용합니다.

## Repository

- Name: `daycraft-planner`
- Visibility: `Public`
- Default branch: `main`
- Issues: Enabled
- Wiki: Disabled

## About

**Description**

> 아이들이 직접 만들고 꾸미고 공유하는 생활계획표 스튜디오 · PNG/WebP/SVG/PDF 출력 · 편집 가능한 공유 링크 · GitHub Pages

**Website**

`https://ko9ma7.github.io/daycraft-planner/`

**Topics**

`kids`, `planner`, `schedule`, `education`, `github-pages`, `pwa`, `svg`, `pdf`, `vanilla-javascript`, `korean`

## GitHub Pages

- Source: `GitHub Actions`
- Workflow: `.github/workflows/deploy.yml`
- Expected URL: `https://ko9ma7.github.io/daycraft-planner/`

## Repository Social Preview

자동 배포에 포함된 이미지:

`src/assets/social-preview.png`

GitHub Repository 자체의 Social Preview 이미지는 GitHub 웹 UI에서 `Settings → General → Social preview`에 위 파일을 한 번 업로드하면 됩니다. 이 항목은 GitHub CLI에 공식 편집 옵션이 없어 자동 스크립트에서는 변경하지 않습니다.

## 기존 저장소에 다시 배포할 때

`배포하기.cmd`는 원격 `main`에 기존 DayCraft 커밋이 있으면 먼저 `origin/main` 이력을 연결하고 현재 폴더의 파일을 새 커밋으로 올립니다. 강제 push는 사용하지 않습니다.

또한 `.gitattributes`가 포함되어 Windows에서도 웹 소스의 LF/CRLF 경고를 최소화합니다.
