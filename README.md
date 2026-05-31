# Personal Memo Dashboard

Google OAuth와 Supabase RLS 기반의 개인 메모 대시보드입니다. 메모 CRUD, 할일 체크, 중요 메모 필터, 전체 검색, 중요 링크 칩을 제공합니다.

## Local Setup

1. 의존성을 설치합니다.

```bash
npm install
```

2. `.env.example`을 참고해 `.env.local`을 만듭니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

3. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.

4. Supabase Auth에서 Google Provider를 켜고 Google OAuth Client ID/Secret을 등록합니다.

5. Supabase Auth Redirect URL에 다음 값을 추가합니다.

```txt
http://localhost:3000/auth/callback
https://YOUR_DOMAIN.vercel.app/auth/callback
```

6. 개발 서버를 실행합니다.

```bash
npm run dev
```

## Routes

- `/`: 로그인 상태에 따라 `/dashboard` 또는 `/login`으로 이동
- `/login`: Google 로그인
- `/auth/callback`: OAuth callback 처리
- `/dashboard`: 전체 메모
- `/dashboard/important`: 중요 메모

## Deployment

1. GitHub repository에 프로젝트를 push합니다.
2. Vercel에서 해당 repository를 연결합니다.
3. Framework Preset은 Next.js로 둡니다.
4. Vercel Project Settings에 `.env.local`과 같은 환경변수를 등록합니다.
5. Production Branch를 `main`으로 설정합니다.

## Verification

```bash
npm run lint
npm run build
```

수동 확인 항목:

- 미로그인 사용자는 `/dashboard` 접근 시 `/login`으로 이동
- Google 로그인 후 대시보드 진입
- 메모 생성, 수정, 삭제, 배경색 변경
- 할일 체크와 취소선 표시
- 중요 메모 토글 및 `/dashboard/important` 조회
- 제목, 내용, 할일 텍스트 검색
- 중요 링크 추가, 새 탭 열기, 삭제
- 다른 사용자 데이터가 RLS로 분리되는지 확인
