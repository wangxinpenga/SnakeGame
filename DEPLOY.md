# GitHub Pages 部署指南

本项目已配置好自动部署到 GitHub Pages 的工作流。按照以下步骤即可完成部署：

## 前置条件

1. 确保你的项目已经推送到 GitHub 仓库
2. **重要**：根据你的仓库名称配置正确的 base 路径：
   - 如果仓库名为 `[用户名].github.io`（用户主页仓库），使用 `base: '/'`
   - 如果仓库名为其他名称（如 `my-snake-game`），使用 `base: '/my-snake-game/'`

## 部署步骤

### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库页面
2. 点击 **Settings** 选项卡
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**

### 2. 推送代码触发部署

```bash
# 添加所有文件到 git
git add .

# 提交更改
git commit -m "Add GitHub Pages deployment configuration"

# 推送到 main 分支
git push origin main
```

### 3. 查看部署状态

1. 推送后，GitHub Actions 会自动开始构建和部署
2. 在仓库页面点击 **Actions** 选项卡查看部署进度
3. 部署成功后，你的游戏将在以下地址可用：
   ```
   https://[你的用户名].github.io/snakegame/
   ```

## 配置说明

### GitHub Actions 工作流 (`.github/workflows/deploy.yml`)

- **触发条件**: 推送到 main 分支时自动触发
- **构建环境**: Ubuntu 最新版本，Node.js 18
- **包管理器**: pnpm
- **构建命令**: `pnpm build`
- **部署目标**: GitHub Pages

### Vite 配置 (`vite.config.ts`)

- **base 路径**: 生产环境设置为 `/snakegame/`，开发环境为 `/`
- **构建输出**: `dist` 目录
- **源码映射**: 隐藏模式（hidden）

## 自定义域名（可选）

如果你想使用自定义域名：

1. 在仓库的 `public` 目录下创建 `CNAME` 文件
2. 在文件中写入你的域名（如：`game.yourdomain.com`）
3. 在你的域名提供商处配置 DNS 记录指向 GitHub Pages

## 故障排除

### 部署失败

1. 检查 Actions 页面的错误日志
2. 确保所有依赖都在 `package.json` 中正确声明
3. 检查构建命令是否能在本地正常运行

### 页面无法访问

1. 确认 GitHub Pages 已启用
2. 检查仓库是否为公开仓库（私有仓库需要 GitHub Pro）
3. 等待几分钟，DNS 传播需要时间

### 白屏或404错误（资源加载失败）

**症状**：页面显示白屏，控制台出现类似 `GET https://用户名.github.io/src/main.tsx net::ERR_ABORTED 404` 的错误

**原因**：`vite.config.ts` 中的 base 路径配置与实际仓库名称不匹配

**解决方案**：
1. 检查你的 GitHub 仓库名称
2. 修改 `vite.config.ts` 中的 base 配置：
   ```typescript
   // 如果仓库名为 username.github.io（用户主页）
   base: process.env.NODE_ENV === 'production' ? '/' : '/'
   
   // 如果仓库名为其他名称（如 my-game）
   base: process.env.NODE_ENV === 'production' ? '/my-game/' : '/'
   ```
3. 重新构建：`pnpm build`
4. 提交并推送更改

## 项目特性

✅ **响应式设计** - 支持桌面和移动设备  
✅ **霓虹风格** - 现代化的视觉效果  
✅ **完整游戏功能** - 移动、碰撞检测、计分系统  
✅ **音效系统** - 背景音乐和游戏音效  
✅ **本地存储** - 自动保存最高分和设置  
✅ **自动部署** - 推送代码即可更新线上版本  

## 后续维护

- **自动更新**: 每次推送到 main 分支都会自动重新部署
- **版本管理**: 可以通过 git 标签管理不同版本
- **监控**: 通过 GitHub Actions 查看部署历史和状态

---

🎮 **享受你的贪吃蛇游戏！**