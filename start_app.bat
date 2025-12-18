@echo off
echo AI 개발 어플리케이션을 시작합니다...
echo 잠시만 기다려주세요, 서버를 실행하고 브라우저를 엽니다.

:: 프로젝트 폴더로 이동 (필요한 경우 수정)
cd /d "%~dp0"

:: 브라우저 자동 실행 (Vite가 보통 자동으로 열지 않으므로 미리 지정)
:: 3초 정도 대기 후 브라우저 열기 (서버 시작 시간 고려)
timeout /t 3 /nobreak >nul
start http://localhost:5173

:: 서버 실행
npm run dev
