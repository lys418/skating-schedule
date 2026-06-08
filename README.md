# 🏒 장호성 쇼트트랙팀 일정 관리 앱

## 배포 순서 (약 10분)

### STEP 1 — GitHub 업로드

1. [github.com](https://github.com) 접속 → 로그인
2. **New repository** → 이름: `skating-schedule` → Public → **Create**
3. **uploading an existing file** 클릭
4. 이 ZIP 안의 파일들을 모두 드래그&드롭
5. **Commit changes** 클릭

### STEP 2 — Vercel 배포

1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. **Add New Project** → `skating-schedule` → **Import**
3. 설정 변경 없이 바로 **Deploy** 클릭
4. 완료! `https://skating-schedule-xxx.vercel.app` 주소 생성

> ✅ Supabase 불필요 — 데이터는 각 브라우저 localStorage에 저장됩니다.

## 기능
- 월별 훈련 일정 캘린더
- AM/PM 시간, 팬스 치기/걷기, 지하, 휴무일 관리
- 날짜 탭 → 상세보기 / 수정
- 캘린더 JPG 이미지 저장
