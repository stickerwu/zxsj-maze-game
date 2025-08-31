#!/bin/bash

# 噩梦潜渊古龙陵萧行云P2内场模拟器 - 部署脚本
# 用于快速部署和管理Docker镜像

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="zxsj-maze-game"
DOCKER_PORT="9898"
GITHUB_REPO="" # 用户需要设置
DOCKER_USERNAME="" # 用户需要设置

# 显示帮助信息
show_help() {
    echo -e "${BLUE}噩梦潜渊古龙陵萧行云P2内场模拟器 - 部署工具${NC}"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示此帮助信息"
    echo "  -b, --build         本地构建Docker镜像"
    echo "  -r, --run           运行Docker容器"
    echo "  -s, --stop          停止Docker容器"
    echo "  -p, --pull          拉取最新镜像"
    echo "  -l, --logs          查看容器日志"
    echo "  -c, --clean         清理Docker资源"
    echo "  --setup             初始化部署环境"
    echo "  --status            查看部署状态"
    echo "  --github-setup     GitHub Actions配置指南"
    echo ""
    echo "示例:"
    echo "  $0 --build         # 构建镜像"
    echo "  $0 --run           # 运行容器"
    echo "  $0 --pull --run    # 拉取最新镜像并运行"
    echo ""
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker未安装，请先安装Docker${NC}"
        echo "安装指南: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker服务未运行，请启动Docker${NC}"
        exit 1
    fi
}

# 初始化配置
setup_config() {
    echo -e "${BLUE}🔧 初始化部署配置${NC}"
    
    # 检查配置文件
    if [ ! -f ".env.deploy" ]; then
        echo "# 部署配置文件" > .env.deploy
        echo "DOCKER_USERNAME=your-dockerhub-username" >> .env.deploy
        echo "GITHUB_REPO=your-github-username/zxsj-maze-game" >> .env.deploy
        echo "PROJECT_NAME=zxsj-maze-game" >> .env.deploy
        echo "DOCKER_PORT=9898" >> .env.deploy
        
        echo -e "${YELLOW}⚠️  请编辑 .env.deploy 文件，设置你的Docker Hub用户名和GitHub仓库${NC}"
        echo "配置文件已创建: .env.deploy"
    else
        echo -e "${GREEN}✅ 配置文件已存在${NC}"
    fi
    
    # 加载配置
    if [ -f ".env.deploy" ]; then
        source .env.deploy
    fi
}

# 构建Docker镜像
build_image() {
    echo -e "${BLUE}🏗️  构建Docker镜像${NC}"
    
    # 确保构建目录存在
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ 未找到package.json，请在项目根目录运行此脚本${NC}"
        exit 1
    fi
    
    # 构建前端项目
    echo "📦 安装依赖..."
    npm install
    
    echo "🏗️  构建项目..."
    npm run build
    
    # 构建Docker镜像
    echo "🐳 构建Docker镜像..."
    docker build -t ${PROJECT_NAME}:latest .
    
    echo -e "${GREEN}✅ 镜像构建完成: ${PROJECT_NAME}:latest${NC}"
}

# 运行容器
run_container() {
    echo -e "${BLUE}🚀 启动Docker容器${NC}"
    
    # 停止现有容器
    if docker ps -q -f name=${PROJECT_NAME} | grep -q .; then
        echo "🛑 停止现有容器..."
        docker stop ${PROJECT_NAME}
        docker rm ${PROJECT_NAME}
    fi
    
    # 启动新容器
    docker run -d \
        --name ${PROJECT_NAME} \
        -p ${DOCKER_PORT}:${DOCKER_PORT} \
        --restart unless-stopped \
        ${DOCKER_USERNAME:+${DOCKER_USERNAME}/}${PROJECT_NAME}:latest
    
    echo -e "${GREEN}✅ 容器启动成功${NC}"
    echo -e "🌐 访问地址: ${BLUE}http://localhost:${DOCKER_PORT}${NC}"
}

# 停止容器
stop_container() {
    echo -e "${BLUE}🛑 停止Docker容器${NC}"
    
    if docker ps -q -f name=${PROJECT_NAME} | grep -q .; then
        docker stop ${PROJECT_NAME}
        docker rm ${PROJECT_NAME}
        echo -e "${GREEN}✅ 容器已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  容器未运行${NC}"
    fi
}

# 拉取最新镜像
pull_image() {
    echo -e "${BLUE}📥 拉取最新镜像${NC}"
    
    if [ -z "$DOCKER_USERNAME" ]; then
        echo -e "${RED}❌ 请先设置DOCKER_USERNAME${NC}"
        exit 1
    fi
    
    docker pull ${DOCKER_USERNAME}/${PROJECT_NAME}:latest
    echo -e "${GREEN}✅ 镜像拉取完成${NC}"
}

# 查看日志
show_logs() {
    echo -e "${BLUE}📋 查看容器日志${NC}"
    
    if docker ps -q -f name=${PROJECT_NAME} | grep -q .; then
        docker logs -f ${PROJECT_NAME}
    else
        echo -e "${YELLOW}⚠️  容器未运行${NC}"
    fi
}

# 清理资源
clean_resources() {
    echo -e "${BLUE}🧹 清理Docker资源${NC}"
    
    # 停止容器
    stop_container
    
    # 删除镜像
    if docker images -q ${PROJECT_NAME} | grep -q .; then
        docker rmi ${PROJECT_NAME}:latest
        echo "🗑️  本地镜像已删除"
    fi
    
    # 清理未使用的资源
    docker system prune -f
    
    echo -e "${GREEN}✅ 清理完成${NC}"
}

# 查看状态
show_status() {
    echo -e "${BLUE}📊 部署状态${NC}"
    echo ""
    
    # Docker状态
    echo "🐳 Docker状态:"
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        echo -e "  ${GREEN}✅ Docker已安装并运行${NC}"
    else
        echo -e "  ${RED}❌ Docker未安装或未运行${NC}"
    fi
    
    # 容器状态
    echo "📦 容器状态:"
    if docker ps -q -f name=${PROJECT_NAME} | grep -q .; then
        echo -e "  ${GREEN}✅ 容器正在运行${NC}"
        echo "  🌐 访问地址: http://localhost:${DOCKER_PORT}"
    else
        echo -e "  ${YELLOW}⚠️  容器未运行${NC}"
    fi
    
    # 镜像状态
    echo "🖼️  镜像状态:"
    if docker images -q ${PROJECT_NAME} | grep -q .; then
        echo -e "  ${GREEN}✅ 本地镜像存在${NC}"
        docker images ${PROJECT_NAME}:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    else
        echo -e "  ${YELLOW}⚠️  本地镜像不存在${NC}"
    fi
    
    echo ""
}

# GitHub Actions配置指南
show_github_setup() {
    echo -e "${BLUE}🔧 GitHub Actions配置指南${NC}"
    echo ""
    echo "1. 创建GitHub仓库并推送代码"
    echo "2. 在仓库设置中添加以下Secrets:"
    echo "   - DOCKER_HUB_USERNAME: 你的Docker Hub用户名"
    echo "   - DOCKER_HUB_ACCESS_TOKEN: Docker Hub访问令牌"
    echo ""
    echo "3. 推送代码到main分支触发自动部署:"
    echo "   git add ."
    echo "   git commit -m 'feat: 触发自动部署'"
    echo "   git push origin main"
    echo ""
    echo "详细配置说明请查看: GITHUB_ACTIONS_SETUP.md"
    echo ""
}

# 主函数
main() {
    # 加载配置
    setup_config
    
    # 解析参数
    case "$1" in
        -h|--help)
            show_help
            ;;
        -b|--build)
            check_docker
            build_image
            ;;
        -r|--run)
            check_docker
            run_container
            ;;
        -s|--stop)
            check_docker
            stop_container
            ;;
        -p|--pull)
            check_docker
            pull_image
            ;;
        -l|--logs)
            check_docker
            show_logs
            ;;
        -c|--clean)
            check_docker
            clean_resources
            ;;
        --setup)
            setup_config
            echo -e "${GREEN}✅ 配置初始化完成${NC}"
            ;;
        --status)
            show_status
            ;;
        --github-setup)
            show_github_setup
            ;;
        "")
            show_help
            ;;
        *)
            echo -e "${RED}❌ 未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"