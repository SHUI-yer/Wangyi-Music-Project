#!/bin/bash

echo "=========================================="
echo "      网抑云深夜emo 项目环境检查"
echo "=========================================="

# 1. 检查 Node.js
if ! command -v node &> /dev/null
then
    echo "[错误] 未检测到 Node.js 环境！"
    echo "请前往 https://nodejs.org/ 下载并安装 LTS 版本。"
    exit 1
fi

# 2. 检查依赖文件夹
if [ ! -d "node_modules" ]; then
    echo "[提示] 检测到首次运行或依赖缺失，正在安装环境..."
    npm install --no-fund --no-audit
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败，请检查网络后重试。"
        exit 1
    fi
    echo "[成功] 环境安装完成！"
fi

# 3. 启动开发服务器
echo "[提示] 正在启动预览界面..."
npm run dev
