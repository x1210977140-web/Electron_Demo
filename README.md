# Electron 核心功能演示

一个展示 Electron 核心功能的演示项目，包含 IPC 通信、原生对话框、窗口控制、文件操作等功能。

## 功能特性

- ✨ 应用信息展示（Electron、Chrome、Node.js 版本）
- 💬 原生系统对话框（消息框、文件选择框、保存对话框）
- 🪟 窗口控制（最小化、最大化、关闭）
- 📁 文件读写操作（通过 IPC 安全通信）
- ⌨️ 全局快捷键（Ctrl+Shift+D 显示/隐藏窗口）
- 🍎 原生应用菜单
- 📋 系统剪贴板集成

## 项目结构

```
Electron_Demo/
├── main.js              # 主进程入口（包含 Electron 核心功能）
├── preload.js           # 预加载脚本（安全的 API 暴露）
├── renderer.js          # 渲染进程逻辑（界面交互）
├── index.html           # 主界面
├── styles.css           # 样式文件
├── package.json         # 项目配置
└── .github/
    └── workflows/
        └── build.yml    # GitHub Actions 配置
```

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发模式
npm start
```

### 构建应用

```bash
# 构建 macOS 版本
npm run build

# 构建 Windows 版本
npm run build:win

# 构建 Linux 版本
npm run build:linux

# 构建所有平台
npm run build:all
```

## GitHub Actions 自动化构建

项目已配置 GitHub Actions，实现以下功能：

### 自动触发条件

- 推送到 `main` 或 `develop` 分支
- 创建 Pull Request 到 `main` 分支
- 推送标签（如 `v1.0.0`）

### 工作流程

1. **构建阶段**
   - 在 macOS、Windows、Linux 三个平台上并行构建
   - 自动安装依赖并执行构建命令
   - 上传构建产物到 GitHub Actions

2. **发布阶段**（仅在推送标签时触发）
   - 下载所有平台的构建产物
   - 创建 GitHub Release
   - 自动附加 DMG、EXE、AppImage 文件

### 使用方法

#### 方式一：自动构建

```bash
# 1. 将代码推送到 GitHub
git add .
git commit -m "feat: add new features"
git push origin main

# 2. 查看 Actions 页面
# 访问 https://github.com/your-username/Electron_Demo/actions
```

#### 方式二：发布新版本

```bash
# 1. 创建并推送标签
git tag v1.0.0
git push origin v1.0.0

# 2. GitHub Actions 会自动：
#    - 构建所有平台的版本
#    - 创建 Release
#    - 上传安装包到 Release 页面
```

### 构建产物

构建完成后，可以从以下位置获取安装包：

- **GitHub Actions Artifacts**：每次构建都会保存 30 天
- **GitHub Releases**：标签推送后永久保存

| 平台 | 文件格式 | 下载位置 |
|------|---------|---------|
| macOS | .dmg | Release 页面 |
| Windows | .exe | Release 页面 |
| Linux | .AppImage | Release 页面 |

## 核心技术

### 主进程 (main.js)

- 应用生命周期管理
- 窗口创建和控制
- IPC 通信处理
- 原生菜单和对话框
- 全局快捷键

### 预加载脚本 (preload.js)

- 使用 `contextBridge` 安全地暴露 API
- IPC 通信桥接
- 事件监听器管理

### 渲染进程 (renderer.js)

- 界面交互逻辑
- 与主进程通信
- DOM 操作

## 安全特性

- ✅ 启用上下文隔离（contextIsolation: true）
- ✅ 禁用 Node.js 集成（nodeIntegration: false）
- ✅ 启用沙箱模式（sandbox: true）
- ✅ 内容安全策略（CSP）
- ✅ 使用 contextBridge 安全暴露 API

## 依赖

- Electron 41.0.2
- electron-builder 25.1.8

## 开发环境

- Node.js 18+
- npm 9+

## 许可证

MIT License
