# 3D迷宫游戏 Docker 部署指南

## 前置要求

### 1. 安装 Docker

#### Windows 系统：
1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 安装完成后重启计算机
3. 启动 Docker Desktop
4. 在命令行中验证安装：`docker --version`

#### Linux 系统：
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo systemctl enable docker

# CentOS/RHEL
sudo yum install docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### macOS 系统：
1. 下载并安装 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. 启动 Docker Desktop
3. 在终端中验证安装：`docker --version`

## 构建和部署步骤

### 1. 构建 Docker 镜像

```bash
# 在项目根目录执行
docker build -t zxsj-maze-game:latest .
```

### 2. 运行容器

```bash
# 运行容器，映射9898端口
docker run -d -p 9898:9898 --name zxsj-maze-game-container zxsj-maze-game:latest
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

# 查看容器日志
docker logs zxsj-maze-game-container
```

## 推送到 Docker Hub

### 1. 登录 Docker Hub

```bash
docker login
```

### 2. 标记镜像

```bash
# 替换 your-username 为你的 Docker Hub 用户名
docker tag zxsj-maze-game:latest your-username/zxsj-maze-game:latest
```

### 3. 推送镜像

```bash
# 推送到 Docker Hub
docker push your-username/zxsj-maze-game:latest
```

### 4. 从 Docker Hub 拉取和运行

```bash
# 其他人可以通过以下命令使用你的镜像
docker pull your-username/zxsj-maze-game:latest
docker run -d -p 9898:9898 --name zxsj-maze-game your-username/zxsj-maze-game:latest
```

## 项目结构说明

```
├── Dockerfile              # Docker 构建文件
├── nginx.conf             # Nginx 配置文件
├── .dockerignore          # Docker 忽略文件
├── dist/                  # 构建输出目录
└── DOCKER_DEPLOYMENT.md   # 部署说明文档
```

## 配置说明

- **端口配置**：容器内外都使用 9898 端口
- **Web服务器**：使用 Nginx 作为静态文件服务器
- **构建方式**：多阶段构建，优化镜像大小
- **缓存策略**：静态资源缓存1年，HTML文件不缓存
- **压缩**：启用 Gzip 压缩提高传输效率

## 故障排除

### 1. Docker 命令未找到
- 确保 Docker 已正确安装并启动
- Windows 用户需要启动 Docker Desktop
- Linux 用户需要启动 Docker 服务

### 2. 端口被占用
```bash
# 查看端口占用情况
netstat -ano | findstr :9898  # Windows
lsof -i :9898                 # Linux/macOS

# 使用其他端口运行
docker run -d -p 8080:9898 --name zxsj-maze-game-container zxsj-maze-game:latest
```

### 3. 构建失败
- 确保项目已成功构建（npm run build）
- 检查 Dockerfile 和 nginx.conf 文件是否正确
- 查看构建日志获取详细错误信息

## 性能优化建议

1. **镜像大小优化**：使用 alpine 基础镜像
2. **多阶段构建**：分离构建环境和运行环境
3. **静态资源缓存**：合理设置缓存策略
4. **Gzip 压缩**：减少传输数据量
5. **健康检查**：添加容器健康检查机制

---

**注意**：请确保在生产环境中使用 HTTPS 并配置适当的安全策略。