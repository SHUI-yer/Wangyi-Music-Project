@echo off
title 网抑云深夜emo - 启动器
color 0C

echo ==========================================
echo       网抑云深夜emo 项目环境检查
echo ==========================================

:: 1. 检查 Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 环境！
    echo 请前往 https://nodejs.org/ 下载并安装 LTS 版本。
    pause
    exit
)

:: 2. 检查依赖文件夹
if not exist "node_modules" (
    echo [提示] 检测到首次运行或依赖缺失，正在安装环境...
    echo 这可能需要几分钟，请保持网络畅通...
    call npm install --no-fund --no-audit
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit
    )
    echo [成功] 环境安装完成！
)

:: 3. 启动开发服务器
echo [提示] 正在启动预览界面...
npm run dev
