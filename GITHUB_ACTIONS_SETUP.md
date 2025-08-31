# GitHub Actions 自动化部署配置指南

## 📋 概述

本项目已配置GitHub Actions工作流，可实现代码提交后自动构建Docker镜像并推送到Docker Hub。工作流包含以下步骤：

1. **代码质量检查** - ESLint代码检查
2. **项目构建** - npm build构建生产版本
3. **Docker镜像构建** - 多平台镜像构建
4. **自动推送** - 推送到Docker Hub
5. **部署通知** - 构建结果通知

## 🔧 配置步骤

### 1. 创建Docker Hub账户

如果还没有Docker Hub账户，请先注册：
- 访问 [Docker Hub](https://hub.docker.com/)
- 注册账户并记住用户名

### 2. 生成Docker Hub访问令牌

1. 登录Docker Hub
2. 点击右上角头像 → **Account Settings**
3. 选择 **Security** 标签页
4. 点击 **New Access Token**
5. 输入令牌名称（如：`github-actions`）
6. 选择权限：**Read, Write, Delete**
7. 点击 **Generate** 并**复制保存**令牌（只显示一次）

### 3. 配置GitHub Secrets

在GitHub仓库中配置以下Secrets：

1. 进入GitHub仓库页面
2. 点击 **Settings** 标签页
3. 在左侧菜单选择 **Secrets and variables** → **Actions**
4. 点击 **New repository secret** 添加以下密钥：

| Secret名称 | 值 | 说明 |
|------------|----|---------|
| `DOCKER_HUB_USERNAME` | 你的Docker Hub用户名 | 用于登录Docker Hub |
| `DOCKER_HUB_ACCESS_TOKEN` | 上一步生成的访问令牌 | 用于认证推送权限 |

### 4. 触发条件

工作流将在以下情况自动触发：

- **推送到主分支** (`main` 或 `master`)
- **创建版本标签** (格式：`v*`，如 `v1.0.0`)
- **创建Pull Request** (仅构建测试，不推送镜像)

## 🚀 使用方法

### 自动部署

1. **提交代码到主分支**：
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push origin main
   ```

2. **创建版本发布**：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **查看构建状态**：
   - 在GitHub仓库的 **Actions** 标签页查看工作流执行状态
   - 构建完成后会显示详细的部署报告

### 手动运行

1. 进入GitHub仓库的 **Actions** 标签页
2. 选择 **Docker Build and Deploy** 工作流
3. 点击 **Run workflow** 按钮
4. 选择分支并点击 **Run workflow**

## 📦 镜像使用

构建成功后，可以通过以下方式使用Docker镜像：

### 拉取最新镜像
```bash
docker pull <你的用户名>/zxsj-maze-game:latest
```

### 运行容器
```bash
docker run -d -p 9898:9898 <你的用户名>/zxsj-maze-game:latest
```

### 使用docker-compose
```bash
docker-compose up -d
```

## 🏷️ 镜像标签策略

工作流会自动生成以下标签：

- `latest` - 主分支最新版本
- `main` - 主分支构建
- `v1.0.0` - 版本标签构建
- `1.0` - 主要版本号
- `pr-123` - Pull Request构建

## 🔍 故障排除

### 常见问题

1. **Docker Hub登录失败**
   - 检查 `DOCKER_HUB_USERNAME` 是否正确
   - 确认 `DOCKER_HUB_ACCESS_TOKEN` 是否有效
   - 验证访问令牌权限是否包含 Write 权限

2. **构建失败**
   - 查看Actions日志中的详细错误信息
   - 确认本地 `npm run build` 能正常执行
   - 检查Dockerfile语法是否正确

3. **推送失败**
   - 确认Docker Hub仓库名称是否正确
   - 检查网络连接是否正常
   - 验证访问令牌是否过期

### 调试方法

1. **本地测试**：
   ```bash
   # 本地构建测试
   npm run build
   docker build -t zxsj-maze-game:test .
   docker run -p 9898:9898 zxsj-maze-game:test
   ```

2. **查看工作流日志**：
   - 在GitHub Actions页面点击失败的工作流
   - 展开各个步骤查看详细日志
   - 重点关注红色错误信息

## 📈 工作流优化

### 性能优化

- ✅ 使用GitHub Actions缓存加速构建
- ✅ 多平台镜像构建 (amd64/arm64)
- ✅ Docker层缓存优化
- ✅ 并行作业执行

### 安全措施

- ✅ 使用官方Actions
- ✅ 最小权限原则
- ✅ Secrets安全存储
- ✅ 仅在非PR时推送镜像

## 🎯 下一步

配置完成后，你的项目将具备：

- 🔄 **持续集成** - 每次提交自动测试
- 🚀 **持续部署** - 自动构建和推送Docker镜像
- 📊 **构建报告** - 详细的部署状态反馈
- 🏷️ **版本管理** - 自动化的镜像标签管理

现在你可以专注于开发，让GitHub Actions处理部署工作！🎮

---

**💡 提示**: 首次配置后建议先创建一个测试提交，验证整个CI/CD流程是否正常工作。