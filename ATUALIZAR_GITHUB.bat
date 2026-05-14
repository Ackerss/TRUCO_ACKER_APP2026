@echo off
echo ========================================
echo  TRUCO ACKER - Atualizando GitHub
echo ========================================
cd /d "%~dp0"
echo.
echo Removendo lock antigo (se existir)...
if exist ".git\index.lock" del /f ".git\index.lock"
echo.
echo Adicionando todos os arquivos...
git add -A
echo.
echo Fazendo commit...
git commit -m "feat: update app v2026 - nova UI glassmorphism, voz Francisca MP3, Mao de 11, Escurinha, tema dark/light, modo 2/4 jogadores, nomes de times"
echo.
echo Enviando para o GitHub...
git push origin master
echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo  SUCESSO! GitHub atualizado!
) else (
    echo  ERRO no push. Verifique suas credenciais do GitHub.
)
echo ========================================
pause
