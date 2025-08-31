# Docker 安装和容器构建指南

## 问题诊断

您遇到的容器构建错误是因为系统中没有安装 Docker。错误信息显示：
```
docker : 无法将"docker"项识别为 cmdlet、函数、脚本文件或可运行程序的名称
```

## Docker 安装步骤

### Windows 系统安装 Docker Desktop

1. **下载 Docker Desktop**
   - 访问 [Docker Desktop 官网](https://www.docker.com/products/docker-desktop/)
   - 点击 "Download for Windows" 下载安装包

2. **系统要求**
   - Windows 10 64-bit: Pro, Enterprise, or Education (Build 16299 或更高版本)
   - 或 Windows 11 64-bit: Home or Pro version 21H2 或更高版本
   - 启用 WSL 2 功能
   - 启用虚拟化功能

3. **安装步骤**
   - 运行下载的 `Docker Desktop Installer.exe`
   - 按照安装向导完成安装
   - 重启计算机
   - 启动 Docker Desktop

4. **验证安装**
   ```bash
   docker --version
   docker run hello-world
   ```

## 容器构建和运行

### 1. 构建 Docker 镜像
```bash
# 在项目根目录执行
docker build -t zxsj-maze-game .
```

### 2. 运行容器
```bash
# 运行容器，映射9898端口
docker run -d -p 9898:9898 --name zxsj-maze-game-container zxsj-maze-game
```

### 3. 访问应用
打开浏览器访问：`http://localhost:9898`

### 4. 管理容器
```bash
# 查看运行中的容器
docker ps

# 停止容器
docker stop zxsj-maze-game-container

# 启动容器
docker start zxsj-maze-game-container

# 删除容器
docker rm zxsj-maze-game-container

# 删除镜像
docker rmi zxsj-maze-game
```

## Docker Hub 部署

### 1. 登录 Docker Hub
```bash
docker login
```

### 2. 标记镜像
```bash
# 替换 your-username 为您的 Docker Hub 用户名
docker tag zxsj-maze-game your-username/zxsj-maze-game:latest
```

### 3. 推送镜像
```bash
docker push your-username/zxsj-maze-game:latest
```

### 4. 从 Docker Hub 拉取和运行
```bash
# 其他人可以通过以下命令运行您的应用
docker run -d -p 9898:9898 your-username/zxsj-maze-game:latest
```

## 项目文件说明

### Dockerfile
- 使用多阶段构建优化镜像大小
- 第一阶段：使用 Node.js 构建应用
- 第二阶段：使用 Nginx 提供静态文件服务
- 暴露 9898 端口

### nginx.conf
- 配置 Nginx 监听 9898 端口
- 支持 SPA 路由
- 启用 Gzip 压缩
- 配置静态文件缓存
- 添加安全头

### .dockerignore
- 排除不必要的文件，减少构建上下文大小
- 提高构建速度

## 故障排除

### 常见问题

1. **Docker Desktop 启动失败**
   - 确保启用了 WSL 2
   - 确保启用了虚拟化功能
   - 重启 Docker Desktop

2. **构建失败**
   - 检查 Dockerfile 语法
   - 确保所有依赖文件存在
   - 查看构建日志获取详细错误信息

3. **端口冲突**
   - 使用不同的端口映射：`-p 8080:9898`
   - 检查端口是否被其他应用占用

4. **权限问题**
   - 以管理员身份运行 PowerShell
   - 确保 Docker Desktop 有足够权限

## 下一步

1. 安装 Docker Desktop
2. 重启系统
3. 验证 Docker 安装
4. 执行构建命令
5. 运行容器并测试应用

安装完成后，您就可以成功构建和运行 3D 迷宫游戏的 Docker 容器了！