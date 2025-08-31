import { create } from 'zustand';
import { ThreeSceneManager } from '../utils/ThreeSceneManager';

// 游戏状态类型定义
export type GameStatus = 'start' | 'playing' | 'success';
export type BallColor = 'blue' | 'yellow' | 'red' | 'green';

// 球体位置接口
export interface BallPosition {
  id: string;
  position: [number, number, number];
  collected: boolean;
}

// 迷宫配置接口
export interface MazeConfig {
  walls: Array<{
    position: [number, number, number];
    size: [number, number, number];
    rotation?: [number, number, number]; // 可选的旋转属性
  }>;
  ballSpawns: Record<BallColor, Array<[number, number, number]>>;
  playerStart: [number, number, number];
}

// 游戏状态接口
export interface GameState {
  // 游戏状态
  gameStatus: GameStatus;
  currentColor: BallColor;
  collectedBalls: number;
  totalBalls: number;
  
  // 玩家状态
  playerPosition: [number, number, number];
  playerRotation: [number, number, number];
  
  // 球体状态
  ballPositions: BallPosition[];
  
  // 自定义迷宫配置
  customMazeConfig: MazeConfig | null;
  
  // 3D场景管理器
  threeSceneManager: ThreeSceneManager | null;
  
  // 键盘输入状态
  keys: {
    w: boolean;
    a: boolean;
    s: boolean;
    d: boolean;
    f: boolean;
    r: boolean;
  };
  
  // 游戏操作方法
  startGame: () => void;
  resetGame: () => void;
  collectBall: (ballId: string) => void;
  updatePlayerPosition: (position: [number, number, number]) => void;
  updatePlayerRotation: (rotation: [number, number, number]) => void;
  setKeyPressed: (key: string, pressed: boolean) => void;
  resetPlayerPosition: () => void;
  checkGameComplete: () => boolean;
  setCustomMazeConfig: (config: MazeConfig) => void;
  clearCustomMazeConfig: () => void;
  setThreeSceneManager: (manager: ThreeSceneManager | null) => void;
}

// 默认迷宫配置 - 来自 maze-config-1756592819976.json
const DEFAULT_MAZE_CONFIG: MazeConfig = {
  "walls": [
    { "position": [-25, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] },
    { "position": [-24, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] },
    { "position": [-23, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] },
    { "position": [-22, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] },
    { "position": [-21, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] },
    { "position": [-20, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] },
    { "position": [-18, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] },
    { "position": [-17, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] },
    { "position": [-16, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] },
    { "position": [-19, 1, 15], "size": [1, 2, 1], "rotation": [0, 0, 0] }
    // 注意：这里只包含部分墙体配置，完整配置将在后续加载
  ],
  "ballSpawns": {
    "blue": [[1, 0.5, -19], [-23, 0.5, -14], [7, 0.5, 17], [22, 0.5, -8]],
    "yellow": [[1, 0.5, -23], [-14, 0.5, -14], [7, 0.5, 1], [-10, 0.5, 11]],
    "red": [[-8, 0.5, -23], [-14, 0.5, 7], [-10, 0.5, 7], [17, 0.5, 17]],
    "green": [[12, 0.5, -8], [-23, 0.5, 7], [-14, 0.5, 22], [11, 0.5, 22]]
  },
  "playerStart": [-1, 0.5, 2]
};

// 球体生成点配置（备用）
const BALL_SPAWN_POINTS = {
  blue: [
    [-8, 0.5, -8], [-2, 0.5, -6], [6, 0.5, 2], [8, 0.5, -8]
  ],
  yellow: [
    [-6, 0.5, -8], [-4, 0.5, 6], [2, 0.5, -2], [4, 0.5, 8]
  ],
  red: [
    [-8, 0.5, -2], [-6, 0.5, 4], [-4, 0.5, 4], [8, 0.5, 6]
  ],
  green: [
    [-8, 0.5, 8], [-6, 0.5, 8], [4, 0.5, -6], [6, 0.5, 8]
  ]
} as const;

// 起始点位置
const START_POINT: [number, number, number] = [0, 0.5, 0];

// 异步加载完整的迷宫配置
const loadFullMazeConfig = async (): Promise<MazeConfig> => {
  try {
    const response = await fetch('/maze-config-1756592819976.json');
    if (response.ok) {
      const config = await response.json();
      return config;
    }
  } catch (error) {
    console.warn('无法加载完整迷宫配置，使用默认配置');
  }
  return DEFAULT_MAZE_CONFIG;
};

// 随机选择球体颜色
const getRandomColor = (): BallColor => {
  const colors: BallColor[] = ['blue', 'yellow', 'red', 'green'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 生成球体位置数据
const generateBallPositions = (color: BallColor, customConfig?: MazeConfig): BallPosition[] => {
  const spawnPoints = customConfig?.ballSpawns[color] || DEFAULT_MAZE_CONFIG.ballSpawns[color] || BALL_SPAWN_POINTS[color];
  return spawnPoints.map((position, index) => ({
    id: `${color}-${index}`,
    position: position as [number, number, number],
    collected: false
  }));
};

// 创建游戏状态store
export const useGameStore = create<GameState>((set, get) => ({
  // 初始状态
  gameStatus: 'start',
  currentColor: 'blue',
  collectedBalls: 0,
  totalBalls: 4,
  playerPosition: DEFAULT_MAZE_CONFIG.playerStart,
  playerRotation: [0, 0, 0],
  ballPositions: [],
  customMazeConfig: DEFAULT_MAZE_CONFIG,
  threeSceneManager: null,
  keys: {
    w: false,
    a: false,
    s: false,
    d: false,
    f: false,
    r: false
  },
  
  // 开始游戏
  startGame: async () => {
    const state = get();
    // 加载完整的迷宫配置
    const fullConfig = await loadFullMazeConfig();
    const randomColor = getRandomColor();
    const ballPositions = generateBallPositions(randomColor, fullConfig);
    const startPosition = fullConfig.playerStart;
    
    set({
      gameStatus: 'playing',
      currentColor: randomColor,
      collectedBalls: 0,
      totalBalls: ballPositions.length,
      ballPositions,
      playerPosition: startPosition,
      playerRotation: [0, 0, 0],
      customMazeConfig: fullConfig
    });
  },
  
  // 重置游戏
  resetGame: () => {
    const state = get();
    const ballPositions = generateBallPositions(state.currentColor, state.customMazeConfig || DEFAULT_MAZE_CONFIG);
    const startPosition = state.customMazeConfig?.playerStart || DEFAULT_MAZE_CONFIG.playerStart;
    
    set({
      gameStatus: 'start',
      collectedBalls: 0,
      totalBalls: ballPositions.length,
      ballPositions,
      playerPosition: startPosition,
      playerRotation: [0, 0, 0]
    });
  },
  
  // 收集球体
  collectBall: (ballId: string) => {
    const state = get();
    const updatedBalls = state.ballPositions.map(ball => 
      ball.id === ballId ? { ...ball, collected: true } : ball
    );
    
    const collectedCount = updatedBalls.filter(ball => ball.collected).length;
    const isGameComplete = collectedCount === state.totalBalls;
    
    set({
      ballPositions: updatedBalls,
      collectedBalls: collectedCount,
      gameStatus: isGameComplete ? 'success' : 'playing'
    });
  },
  
  // 更新玩家位置
  updatePlayerPosition: (position: [number, number, number]) => {
    set({ playerPosition: position });
  },
  
  // 更新玩家旋转
  updatePlayerRotation: (rotation: [number, number, number]) => {
    set({ playerRotation: rotation });
  },
  
  // 设置按键状态
  setKeyPressed: (key: string, pressed: boolean) => {
    const state = get();
    const normalizedKey = key.toLowerCase();
    
    if (normalizedKey in state.keys) {
      set({
        keys: {
          ...state.keys,
          [normalizedKey]: pressed
        }
      });
    }
  },
  
  // 重置玩家位置
  resetPlayerPosition: () => {
    const state = get();
    const startPosition = state.customMazeConfig?.playerStart || DEFAULT_MAZE_CONFIG.playerStart;
    set({ 
      playerPosition: startPosition,
      playerRotation: [0, 0, 0]
    });
  },
  
  // 检查游戏是否完成
  checkGameComplete: () => {
    const state = get();
    return state.collectedBalls === state.totalBalls;
  },
  
  // 设置自定义迷宫配置
  setCustomMazeConfig: (config: MazeConfig) => {
    set({ customMazeConfig: config });
  },
  
  // 清除自定义迷宫配置
  clearCustomMazeConfig: () => {
    set({ customMazeConfig: null });
  },
  
  // 设置3D场景管理器
  setThreeSceneManager: (manager: ThreeSceneManager | null) => {
    set({ threeSceneManager: manager });
  }
}));