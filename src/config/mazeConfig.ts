// 迷宫配置文件
// 定义迷宫的墙体位置和布局数据

// 墙体类型定义
export interface WallConfig {
  position: [number, number, number]; // 墙体位置 [x, y, z]
  size: [number, number, number];     // 墙体尺寸 [width, height, depth]
  rotation?: [number, number, number]; // 墙体旋转 [x, y, z] (可选)
}

// 迷宫尺寸配置
export const MAZE_CONFIG = {
  // 迷宫整体尺寸 - 适应50x50网格
  width: 50,
  height: 50,
  wallHeight: 3,
  wallThickness: 0.75,
  
  // 网格单位大小
  gridSize: 2,
  
  // 起始点位置
  startPoint: [0, 0.75, 0] as [number, number, number],
  
  // 迷宫边界 - 适应50x50网格
  bounds: {
    minX: -25,
    maxX: 25,
    minZ: -25,
    maxZ: 25
  }
};

// 迷宫墙体配置数组 - 扩大1.5倍并优化转角贴合
// 基于网格系统，每个墙体的位置和尺寸
export const MAZE_WALLS: WallConfig[] = [
  // 外围边界墙 - 扩大1.5倍
  // 上边界
  { position: [0, 1.5, -15], size: [30, 3, 0.75] },
  // 下边界
  { position: [0, 1.5, 15], size: [30, 3, 0.75] },
  // 左边界
  { position: [-15, 1.5, 0], size: [0.75, 3, 30] },
  // 右边界
  { position: [15, 1.5, 0], size: [0.75, 3, 30] },
  
  // 内部迷宫墙体 - 扩大1.5倍并优化贴合
  // 第一层内部墙体
  { position: [-12, 1.5, -9], size: [0.75, 3, 12] },
  { position: [-9, 1.5, -12], size: [6, 3, 0.75] },
  { position: [-3, 1.5, -12], size: [0.75, 3, 6] },
  { position: [0, 1.5, -9], size: [6, 3, 0.75] },
  { position: [3, 1.5, -6], size: [0.75, 3, 6] },
  { position: [6, 1.5, -3], size: [6, 3, 0.75] },
  { position: [12, 1.5, -6], size: [0.75, 3, 12] },
  
  // 第二层内部墙体
  { position: [-9, 1.5, -3], size: [0.75, 3, 6] },
  { position: [-6, 1.5, 0], size: [6, 3, 0.75] },
  { position: [-3, 1.5, 3], size: [0.75, 3, 6] },
  { position: [0, 1.5, 6], size: [6, 3, 0.75] },
  { position: [3, 1.5, 9], size: [0.75, 3, 6] },
  { position: [9, 1.5, 6], size: [12, 3, 0.75] },
  
  // 第三层内部墙体
  { position: [-12, 1.5, 3], size: [6, 3, 0.75] },
  { position: [-9, 1.5, 6], size: [0.75, 3, 6] },
  { position: [-6, 1.5, 9], size: [6, 3, 0.75] },
  { position: [-3, 1.5, 12], size: [0.75, 3, 6] },
  { position: [6, 1.5, 12], size: [12, 3, 0.75] },
  { position: [9, 1.5, 9], size: [0.75, 3, 6] },
  
  // 中央区域墙体 - 扩大1.5倍
  { position: [-6, 1.5, -6], size: [0.75, 3, 3] },
  { position: [-3, 1.5, -3], size: [3, 3, 0.75] },
  { position: [0, 1.5, -3], size: [0.75, 3, 3] },
  { position: [3, 1.5, 0], size: [3, 3, 0.75] },
  { position: [6, 1.5, 3], size: [0.75, 3, 3] },
  
  // 额外的复杂路径墙体 - 扩大1.5倍
  { position: [-9, 1.5, 0], size: [3, 3, 0.75] },
  { position: [-12, 1.5, 9], size: [0.75, 3, 3] },
  { position: [12, 1.5, 3], size: [0.75, 3, 3] },
  { position: [9, 1.5, -9], size: [3, 3, 0.75] },
  { position: [0, 1.5, 12], size: [3, 3, 0.75] },
];

// 球体生成点配置 - 扩大1.5倍
// 每种颜色的球体在迷宫中的固定生成位置
export const BALL_SPAWN_POINTS = {
  blue: [
    [-12, 0.75, -12], // 左上角
    [-3, 0.75, -9],   // 上方中间
    [9, 0.75, 3],     // 右方中间
    [12, 0.75, -12]   // 右上角
  ],
  yellow: [
    [-9, 0.75, -12],  // 左上方
    [-6, 0.75, 9],    // 左下方
    [3, 0.75, -3],    // 中央偏右
    [6, 0.75, 12]     // 右下角
  ],
  red: [
    [-12, 0.75, -3],  // 左方中间
    [-9, 0.75, 6],    // 左下方
    [-6, 0.75, 6],    // 左下方2
    [12, 0.75, 9]     // 右下方
  ],
  green: [
    [-12, 0.75, 12],  // 左下角
    [-9, 0.75, 12],   // 左下方
    [6, 0.75, -9],    // 右上方
    [9, 0.75, 12]     // 右下方
  ]
} as const;

// 检查位置是否与墙体碰撞的工具函数
export const checkWallCollision = (
  position: [number, number, number],
  radius: number = 0.3,
  customWalls?: WallConfig[]
): boolean => {
  const [x, y, z] = position;
  
  // 检查边界碰撞
  if (
    x - radius < MAZE_CONFIG.bounds.minX ||
    x + radius > MAZE_CONFIG.bounds.maxX ||
    z - radius < MAZE_CONFIG.bounds.minZ ||
    z + radius > MAZE_CONFIG.bounds.maxZ
  ) {
    return true;
  }
  
  // 使用自定义墙体配置或默认配置
  const wallsToCheck = customWalls || MAZE_WALLS;
  
  // 检查与内部墙体的碰撞
  for (const wall of wallsToCheck) {
    const [wx, wy, wz] = wall.position;
    const [width, height, depth] = wall.size;
    
    // 简单的AABB碰撞检测
    if (
      x + radius > wx - width / 2 &&
      x - radius < wx + width / 2 &&
      z + radius > wz - depth / 2 &&
      z - radius < wz + depth / 2 &&
      y + radius > wy - height / 2 &&
      y - radius < wy + height / 2
    ) {
      return true;
    }
  }
  
  return false;
};

// 获取有效的移动位置（避免穿墙）
export const getValidPosition = (
  currentPosition: [number, number, number],
  targetPosition: [number, number, number],
  radius: number = 0.3,
  customWalls?: WallConfig[]
): [number, number, number] => {
  // 如果目标位置没有碰撞，直接返回
  if (!checkWallCollision(targetPosition, radius, customWalls)) {
    return targetPosition;
  }
  
  // 如果有碰撞，尝试只在X轴移动
  const xOnlyPosition: [number, number, number] = [
    targetPosition[0],
    currentPosition[1],
    currentPosition[2]
  ];
  if (!checkWallCollision(xOnlyPosition, radius, customWalls)) {
    return xOnlyPosition;
  }
  
  // 尝试只在Z轴移动
  const zOnlyPosition: [number, number, number] = [
    currentPosition[0],
    currentPosition[1],
    targetPosition[2]
  ];
  if (!checkWallCollision(zOnlyPosition, radius, customWalls)) {
    return zOnlyPosition;
  }
  
  // 如果都不行，保持当前位置
  return currentPosition;
};