@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 噩梦潜渊古龙陵萧行云P2内场模拟器 - Windows部署脚本
REM 用于快速部署和管理Docker镜像

set PROJECT_NAME=zxsj-maze-game
set DOCKER_PORT=9898
set DOCKER_USERNAME=
set GITHUB_REPO=

REM 颜色定义（Windows 10+）
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 显示帮助信息
:show_help
echo %BLUE%噩梦潜渊古龙陵萧行云P2内场模拟器 - 部署工具%NC%
echo.
echo 用法: %~nx0 [选项]
echo.
echo 选项:
echo   help          显示此帮助信息
echo   build         本地构建Docker镜像
echo   run           运行Docker容器
echo   stop          停止Docker容器
echo   pull          拉取最新镜像
echo   logs          查看容器日志
echo   clean         清理Docker资源
echo   setup         初始化部署环境
echo   status        查看部署状态
echo   github-setup  GitHub Actions配置指南
echo.
echo 示例:
echo   %~nx0 build         # 构建镜像
echo   %~nx0 run           # 运行容器
echo   %~nx0 pull          # 拉取最新镜像
echo.
goto :eof

REM 检查Docker是否安装
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Docker未安装，请先安装Docker Desktop%NC%
    echo 下载地址: https://www.docker.com/products/docker-desktop
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Docker服务未运行，请启动Docker Desktop%NC%
    exit /b 1
)
goto :eof

REM 初始化配置
:setup_config
echo %BLUE%🔧 初始化部署配置%NC%

if not exist ".env.deploy" (
    echo # 部署配置文件 > .env.deploy
    echo DOCKER_USERNAME=your-dockerhub-username >> .env.deploy
    echo GITHUB_REPO=your-github-username/zxsj-maze-game >> .env.deploy
    echo PROJECT_NAME=zxsj-maze-game >> .env.deploy
    echo DOCKER_PORT=9898 >> .env.deploy
    
    echo %YELLOW%⚠️  请编辑 .env.deploy 文件，设置你的Docker Hub用户名和GitHub仓库%NC%
    echo 配置文件已创建: .env.deploy
) else (
    echo %GREEN%✅ 配置文件已存在%NC%
)

REM 加载配置
if exist ".env.deploy" (
    for /f "tokens=1,2 delims==" %%a in (.env.deploy) do (
        if "%%a"=="DOCKER_USERNAME" set DOCKER_USERNAME=%%b
        if "%%a"=="GITHUB_REPO" set GITHUB_REPO=%%b
        if "%%a"=="PROJECT_NAME" set PROJECT_NAME=%%b
        if "%%a"=="DOCKER_PORT" set DOCKER_PORT=%%b
    )
)
goto :eof

REM 构建Docker镜像
:build_image
echo %BLUE%🏗️  构建Docker镜像%NC%

if not exist "package.json" (
    echo %RED%❌ 未找到package.json，请在项目根目录运行此脚本%NC%
    exit /b 1
)

echo 📦 安装依赖...
npm install
if errorlevel 1 (
    echo %RED%❌ 依赖安装失败%NC%
    exit /b 1
)

echo 🏗️  构建项目...
npm run build
if errorlevel 1 (
    echo %RED%❌ 项目构建失败%NC%
    exit /b 1
)

echo 🐳 构建Docker镜像...
docker build -t %PROJECT_NAME%:latest .
if errorlevel 1 (
    echo %RED%❌ Docker镜像构建失败%NC%
    exit /b 1
)

echo %GREEN%✅ 镜像构建完成: %PROJECT_NAME%:latest%NC%
goto :eof

REM 运行容器
:run_container
echo %BLUE%🚀 启动Docker容器%NC%

REM 停止现有容器
docker ps -q -f name=%PROJECT_NAME% >nul 2>&1
if not errorlevel 1 (
    echo 🛑 停止现有容器...
    docker stop %PROJECT_NAME% >nul 2>&1
    docker rm %PROJECT_NAME% >nul 2>&1
)

REM 启动新容器
if "%DOCKER_USERNAME%"=="" (
    set IMAGE_NAME=%PROJECT_NAME%:latest
) else (
    set IMAGE_NAME=%DOCKER_USERNAME%/%PROJECT_NAME%:latest
)

docker run -d --name %PROJECT_NAME% -p %DOCKER_PORT%:%DOCKER_PORT% --restart unless-stopped !IMAGE_NAME!
if errorlevel 1 (
    echo %RED%❌ 容器启动失败%NC%
    exit /b 1
)

echo %GREEN%✅ 容器启动成功%NC%
echo %BLUE%🌐 访问地址: http://localhost:%DOCKER_PORT%%NC%
goto :eof

REM 停止容器
:stop_container
echo %BLUE%🛑 停止Docker容器%NC%

docker ps -q -f name=%PROJECT_NAME% >nul 2>&1
if not errorlevel 1 (
    docker stop %PROJECT_NAME% >nul 2>&1
    docker rm %PROJECT_NAME% >nul 2>&1
    echo %GREEN%✅ 容器已停止%NC%
) else (
    echo %YELLOW%⚠️  容器未运行%NC%
)
goto :eof

REM 拉取最新镜像
:pull_image
echo %BLUE%📥 拉取最新镜像%NC%

if "%DOCKER_USERNAME%"=="" (
    echo %RED%❌ 请先设置DOCKER_USERNAME%NC%
    exit /b 1
)

docker pull %DOCKER_USERNAME%/%PROJECT_NAME%:latest
if errorlevel 1 (
    echo %RED%❌ 镜像拉取失败%NC%
    exit /b 1
)

echo %GREEN%✅ 镜像拉取完成%NC%
goto :eof

REM 查看日志
:show_logs
echo %BLUE%📋 查看容器日志%NC%

docker ps -q -f name=%PROJECT_NAME% >nul 2>&1
if not errorlevel 1 (
    docker logs -f %PROJECT_NAME%
) else (
    echo %YELLOW%⚠️  容器未运行%NC%
)
goto :eof

REM 清理资源
:clean_resources
echo %BLUE%🧹 清理Docker资源%NC%

REM 停止容器
call :stop_container

REM 删除镜像
docker images -q %PROJECT_NAME% >nul 2>&1
if not errorlevel 1 (
    docker rmi %PROJECT_NAME%:latest >nul 2>&1
    echo 🗑️  本地镜像已删除
)

REM 清理未使用的资源
docker system prune -f >nul 2>&1

echo %GREEN%✅ 清理完成%NC%
goto :eof

REM 查看状态
:show_status
echo %BLUE%📊 部署状态%NC%
echo.

REM Docker状态
echo 🐳 Docker状态:
docker --version >nul 2>&1
if not errorlevel 1 (
    docker info >nul 2>&1
    if not errorlevel 1 (
        echo   %GREEN%✅ Docker已安装并运行%NC%
    ) else (
        echo   %RED%❌ Docker未运行%NC%
    )
) else (
    echo   %RED%❌ Docker未安装%NC%
)

REM 容器状态
echo 📦 容器状态:
docker ps -q -f name=%PROJECT_NAME% >nul 2>&1
if not errorlevel 1 (
    echo   %GREEN%✅ 容器正在运行%NC%
    echo   🌐 访问地址: http://localhost:%DOCKER_PORT%
) else (
    echo   %YELLOW%⚠️  容器未运行%NC%
)

REM 镜像状态
echo 🖼️  镜像状态:
docker images -q %PROJECT_NAME% >nul 2>&1
if not errorlevel 1 (
    echo   %GREEN%✅ 本地镜像存在%NC%
    docker images %PROJECT_NAME%:latest
) else (
    echo   %YELLOW%⚠️  本地镜像不存在%NC%
)

echo.
goto :eof

REM GitHub Actions配置指南
:show_github_setup
echo %BLUE%🔧 GitHub Actions配置指南%NC%
echo.
echo 1. 创建GitHub仓库并推送代码
echo 2. 在仓库设置中添加以下Secrets:
echo    - DOCKER_HUB_USERNAME: 你的Docker Hub用户名
echo    - DOCKER_HUB_ACCESS_TOKEN: Docker Hub访问令牌
echo.
echo 3. 推送代码到main分支触发自动部署:
echo    git add .
echo    git commit -m "feat: 触发自动部署"
echo    git push origin main
echo.
echo 详细配置说明请查看: GITHUB_ACTIONS_SETUP.md
echo.
goto :eof

REM 主函数
:main
REM 加载配置
call :setup_config

REM 解析参数
if "%1"=="" goto show_help
if "%1"=="help" goto show_help
if "%1"=="build" (
    call :check_docker
    call :build_image
    goto :eof
)
if "%1"=="run" (
    call :check_docker
    call :run_container
    goto :eof
)
if "%1"=="stop" (
    call :check_docker
    call :stop_container
    goto :eof
)
if "%1"=="pull" (
    call :check_docker
    call :pull_image
    goto :eof
)
if "%1"=="logs" (
    call :check_docker
    call :show_logs
    goto :eof
)
if "%1"=="clean" (
    call :check_docker
    call :clean_resources
    goto :eof
)
if "%1"=="setup" (
    call :setup_config
    echo %GREEN%✅ 配置初始化完成%NC%
    goto :eof
)
if "%1"=="status" (
    call :show_status
    goto :eof
)
if "%1"=="github-setup" (
    call :show_github_setup
    goto :eof
)

echo %RED%❌ 未知选项: %1%NC%
goto show_help

REM 运行主函数
call :main %*