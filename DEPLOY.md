# GitHub Pages 部署指南

本项目已配置好自动部署到 GitHub Pages 的工作流。按照以下步骤即可完成部署：

## 前置条件

1. 确保你的项目已经推送到 GitHub 仓库
2. **重要**：根据你的仓库名称配置正确的 base 路径：
   - 如果仓库名为 `[用户名].github.io`（用户主页仓库），使用 `base: '/'`
   - 如果仓库名为其他名称（如 `my-snake-game`），使用 `base: '/my-snake-game/'`

## 部署步骤

### 1. 启用 GitHub Pages

**重要：必须正确配置 GitHub Pages 才能访问项目**

1. 进入你的 GitHub 仓库页面：`https://github.com/你的用户名/SnakeGame`
2. 点击 "Settings" 选项卡（在仓库顶部导航栏）
3. 在左侧菜单中向下滚动找到 "Pages" 选项
4. 在 "Source" 部分：
   - 选择 "Deploy from a branch" 或 "GitHub Actions"
   - **推荐选择 "GitHub Actions"**（这样会使用我们的自动部署工作流）
5. 点击 "Save" 保存设置
6. 等待几分钟，页面会显示你的网站地址：`https://你的用户名.github.io/SnakeGame/`

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

### 1. 白屏或 404 错误

**症状：** 访问 GitHub Pages 地址时出现白屏或看到 404 错误

**原因：** `vite.config.ts` 中的 `base` 路径配置不正确

**解决方案：**

1. **检查你的仓库名称**：
   - 如果仓库名是 `SnakeGame`，`base` 应该设置为 `/SnakeGame/`
   - 如果仓库名是 `你的用户名.github.io`，`base` 应该设置为 `/`

2. **修改 `vite.config.ts`**：
   ```typescript
   export default defineConfig({
     base: process.env.NODE_ENV === 'production' ? '/你的仓库名/' : '/',
     // ... 其他配置
   })
   ```

3. **重新构建和推送**：
   ```bash
   pnpm build
   git add .
   git commit -m "fix: update base path for GitHub Pages"
   git push
   ```

### 2. GitHub Pages 未启用或部署失败

**症状：** 浏览器请求错误路径如 `https://用户名.github.io/src/main.tsx`

**原因：** GitHub Pages 没有正确启用或部署没有成功

**诊断步骤：**

1. **检查 GitHub Pages 设置**：
   - 访问 `https://github.com/你的用户名/SnakeGame/settings/pages`
   - 确认 "Source" 设置为 "GitHub Actions"
   - 查看是否显示网站地址

2. **检查 GitHub Actions 部署状态**：
   - 访问 `https://github.com/你的用户名/SnakeGame/actions`
   - 查看最新的工作流运行状态
   - 如果显示红色 ❌，点击查看错误详情
   - 如果显示绿色 ✅，说明部署成功

3. **检查部署权限**：
   - 在仓库 Settings → Actions → General
   - 确认 "Workflow permissions" 设置为 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"

4. **手动触发部署**：
   ```bash
   # 推送一个空提交来触发部署
   git commit --allow-empty -m "trigger deployment"
   git push
   ```

**解决方案：**
- 如果 GitHub Pages 未启用，按照上面的步骤 1 启用
- 如果权限不足，按照步骤 3 调整权限设置
- 等待 5-10 分钟让部署完成
- 访问正确的地址：`https://你的用户名.github.io/SnakeGame/`

### 3. 部署失败

1. 检查 Actions 页面的错误日志
2. 确保所有依赖都在 `package.json` 中正确声明
3. 检查构建命令是否能在本地正常运行

### 4. 页面无法访问

1. 确认 GitHub Pages 已启用
2. 检查仓库是否为公开仓库（私有仓库需要 GitHub Pro）
3. 等待几分钟，DNS 传播需要时间

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