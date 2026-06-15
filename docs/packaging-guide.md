# 项目打包与运行指南

## 1. 开发环境要求
- **Node.js**: v18.0.0 或以上版本
- **npm**: v9.0.0 或以上版本

## 2. 快速启动
如果你已经安装了 Node.js，可以直接运行根目录下的启动脚本：
- **Windows**: 双击 `scripts/start.bat`
- **Linux/Mac**: 运行 `sh scripts/start.sh` (需自行创建)

或者手动启动：
```bash
cd apps/frontend
npm install
npm run dev
```

## 3. 打包发布
如需生成可部署的静态文件，运行：
```bash
cd apps/frontend
npm run build
```
打包后的文件将存放在 `apps/frontend/dist/` 目录下。

## 4. 提交物清单
- `apps/frontend/`: 完整源代码
- `docs/`: 实训报告、分工表、每日日志
- `scripts/`: 一键启动脚本
- `README.md`: 项目总览
