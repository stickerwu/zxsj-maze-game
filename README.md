# 噩梦潜渊古龙陵萧行云P2内场模拟器

🎮 **P2迷宫模拟器** - 一个基于 React + Three.js 的 3D 迷宫游戏，模拟噩梦潜渊古龙陵萧行云P2内场的迷宫挑战。

![游戏截图](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=3D+Maze+Game)

## 🌟 项目特色

- 🎯 **沉浸式3D体验** - 使用 Three.js 构建的真实3D迷宫环境
- 🎮 **流畅的游戏控制** - WASD移动 + 鼠标视角控制
- 🗺️ **智能小地图** - 实时显示玩家位置和迷宫结构
- ⚡ **迷宫编辑器** - 可视化编辑和自定义迷宫布局
- 🎨 **现代化UI** - 基于 Tailwind CSS 的响应式界面
- 🐳 **容器化部署** - 完整的 Docker 支持
- 🚀 **自动化CI/CD** - GitHub Actions 自动构建和部署

## 🎯 游戏玩法

### 目标
在3D迷宫中收集所有的球体道具，找到出口完成挑战。

### 控制方式
- **WASD** - 角色移动（基于角色朝向）
- **鼠标右键拖拽** - 控制视角旋转
- **鼠标滚轮** - 调整视角距离
- **小地图** - 查看整体迷宫布局和当前位置

### 游戏特性
- 🔵 **收集系统** - 收集迷宫中的蓝色球体
- 📍 **起点标识** - 3D文字显示游戏起始位置
- 🗺️ **实时小地图** - 动态显示玩家位置和已探索区域
- ⚡ **流畅操作** - 60FPS的3D渲染体验

## 🏗️ 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | ^18.3.1 | 前端框架 |
| **TypeScript** | ^5.6.2 | 类型安全 |
| **Three.js** | ^0.170.0 | 3D图形渲染 |
| **@react-three/fiber** | ^8.17.10 | React Three.js 集成 |
| **@react-three/drei** | ^9.114.3 | Three.js 工具库 |
| **Vite** | ^5.4.10 | 构建工具 |
| **Tailwind CSS** | ^3.4.14 | 样式框架 |
| **Zustand** | ^5.0.1 | 状态管理 |
| **React Router** | ^6.28.0 | 路由管理 |

### 项目结构

```
zxsj-maze-game/
├── src/
│   ├── components/          # React组件
│   │   ├── GameUI.tsx      # 游戏界面组件
│   │   ├── MazeScene.tsx   # 3D迷宫场景
│   │   ├── Player.tsx      # 玩家控制器
│   │   ├── MiniMap.tsx     # 小地图组件
│   │   └── CollectableBalls.tsx # 收集道具
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   └── MazeEditor.tsx  # 迷宫编辑器
│   ├── hooks/              # 自定义Hooks
│   │   ├── useKeyboardControls.ts # 键盘控制
│   │   └── useTheme.ts     # 主题管理
│   ├── store/              # 状态管理
│   │   └── gameStore.ts    # 游戏状态
│   ├── utils/              # 工具函数
│   │   └── ThreeSceneManager.ts # 3D场景管理
│   └── config/             # 配置文件
│       └── mazeConfig.ts   # 迷宫配置
├── public/                 # 静态资源
├── docker/                 # Docker配置
└── .github/workflows/      # CI/CD配置
```

### 核心架构设计

#### 1. 3D渲染架构
- **ThreeSceneManager** - 核心3D场景管理器
- **React Three Fiber** - React与Three.js的桥梁
- **组件化3D对象** - 迷宫墙体、玩家、道具等独立组件

#### 2. 状态管理架构
- **Zustand Store** - 轻量级状态管理
- **游戏状态** - 玩家位置、收集进度、游戏设置
- **迷宫数据** - 动态加载和编辑的迷宫配置

#### 3. 控制系统架构
- **键盘事件处理** - WASD移动控制
- **鼠标事件处理** - 视角旋转和缩放
- **碰撞检测** - 墙体碰撞和道具收集

## ⚙️ 配置说明

### 环境要求
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 或 **pnpm** >= 7.0.0
- **Docker** >= 20.0.0 (可选)

### 开发环境配置

#### 1. 克隆项目
```bash
git clone https://github.com/your-username/zxsj-maze-game.git
cd zxsj-maze-game
```

#### 2. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐)
pnpm install
```

#### 3. 启动开发服务器
```bash
npm run dev
# 或
pnpm dev
```

访问 `http://localhost:5173` 开始游戏

### 生产环境配置

#### 1. 构建项目
```bash
npm run build
# 或
pnpm build
```

#### 2. 预览构建结果
```bash
npm run preview
# 或
pnpm preview
```

### 迷宫配置

迷宫布局通过 `src/config/mazeConfig.ts` 配置：

```typescript
export const defaultMazeConfig = {
  width: 10,        // 迷宫宽度
  height: 10,       // 迷宫高度
  walls: [...],     // 墙体位置数组
  collectables: [...], // 收集道具位置
  playerStart: { x: 1, z: 1 }, // 玩家起始位置
  exit: { x: 8, z: 8 }         // 出口位置
}
```

## 🐳 Docker 部署

### 快速启动

```bash
# 使用 docker-compose (推荐)
docker-compose up -d

# 或直接运行容器
docker run -d -p 9898:9898 --name zxsj-maze-game zxsj-maze-game:latest
```

访问 `http://localhost:9898` 开始游戏

### 自定义构建

```bash
# 构建镜像
docker build -t zxsj-maze-game:latest .

# 运行容器
docker run -d -p 9898:9898 zxsj-maze-game:latest
```

### Docker配置说明

- **基础镜像**: `nginx:alpine`
- **暴露端口**: `9898`
- **静态文件**: 自动构建并复制到Nginx
- **配置优化**: Gzip压缩、缓存策略、SPA支持

## 🚀 CI/CD 自动化部署

项目集成了 GitHub Actions 自动化工作流，支持：

### 自动化流程
1. **代码推送触发** - 推送到 `main` 分支自动触发
2. **环境准备** - 自动安装 Node.js 和依赖
3. **代码检查** - ESLint 代码质量检查
4. **项目构建** - 自动构建生产版本
5. **Docker构建** - 自动构建Docker镜像
6. **镜像推送** - 推送到 Docker Hub
7. **部署通知** - 构建结果通知

### 配置要求

在 GitHub 仓库设置中添加以下 Secrets：

```
DOCKER_HUB_USERNAME=your-dockerhub-username
DOCKER_HUB_ACCESS_TOKEN=your-dockerhub-token
```

### 工作流文件

详细配置请查看 `.github/workflows/docker-deploy.yml`

## 📝 开发指南

### 添加新迷宫

1. 在 `src/config/mazeConfig.ts` 中定义新的迷宫配置
2. 使用迷宫编辑器可视化编辑
3. 导出配置文件并保存

### 自定义游戏元素

1. **添加新道具** - 在 `CollectableBalls.tsx` 中扩展
2. **修改玩家模型** - 编辑 `Player.tsx` 组件
3. **调整游戏规则** - 修改 `gameStore.ts` 状态逻辑

### 性能优化

- 使用 `React.memo` 优化组件渲染
- 合理使用 Three.js 的 `instancedMesh` 批量渲染
- 启用 Vite 的代码分割和懒加载

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Three.js](https://threejs.org/) - 强大的3D图形库
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - React与Three.js的完美结合
- [Vite](https://vitejs.dev/) - 快速的构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用的CSS框架

---

**🎮 开始你的迷宫冒险之旅吧！**
