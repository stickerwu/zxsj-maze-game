import React from 'react';
import { useGameStore, BallColor } from '../store/gameStore';
import { MAZE_WALLS, MAZE_CONFIG } from '../config/mazeConfig';

// 小地图配置 - 适应50x50网格
const MINIMAP_CONFIG = {
  size: 200, // 小地图尺寸 - 适应50x50网格
  scale: 10, // 缩放比例 - 适应50x50网格
  centerX: 100, // 小地图中心X
  centerY: 100, // 小地图中心Y
};

// 球体颜色配置
const BALL_COLORS = {
  blue: '#3B82F6',
  yellow: '#EAB308',
  red: '#EF4444',
  green: '#10B981'
} as const;

// 坐标转换函数：世界坐标 -> 小地图坐标
const worldToMinimap = (worldX: number, worldZ: number) => {
  // 迷宫世界坐标范围：-25到25 (总共50单位)
  // 小地图坐标范围：0到200 (总共200像素)
  const x = MINIMAP_CONFIG.centerX + (worldX / 25) * (MINIMAP_CONFIG.size / 2);
  const y = MINIMAP_CONFIG.centerY + (worldZ / 25) * (MINIMAP_CONFIG.size / 2);
  return { x, y };
};

// 墙体组件
const MinimapWall: React.FC<{ position: [number, number, number]; size: [number, number, number] }> = ({ position, size }) => {
  const [wx, , wz] = position;
  const [width, , depth] = size;
  
  const { x, y } = worldToMinimap(wx, wz);
  // 将世界尺寸转换为小地图像素尺寸
  const scaledWidth = (width / 25) * (MINIMAP_CONFIG.size / 2);
  const scaledHeight = (depth / 25) * (MINIMAP_CONFIG.size / 2);
  
  return (
    <rect
      x={x - scaledWidth / 2}
      y={y - scaledHeight / 2}
      width={scaledWidth}
      height={scaledHeight}
      fill="#8B5CF6"
      opacity={0.8}
      stroke="#A855F7"
      strokeWidth={0.5}
    />
  );
};

// 玩家指示器组件
const MinimapPlayer: React.FC = () => {
  const { playerPosition, playerRotation } = useGameStore();
  const [px, , pz] = playerPosition;
  const [, ry] = playerRotation;
  
  const { x, y } = worldToMinimap(px, pz);
  
  // 计算玩家朝向箭头的点
  const arrowLength = 6;
  const arrowX = x + Math.sin(ry) * arrowLength;
  const arrowY = y + Math.cos(ry) * arrowLength;
  
  return (
    <g>
      {/* 玩家位置圆点 */}
      <circle
        cx={x}
        cy={y}
        r={4}
        fill="#3B82F6"
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      {/* 玩家朝向箭头 */}
      <line
        x1={x}
        y1={y}
        x2={arrowX}
        y2={arrowY}
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle
        cx={arrowX}
        cy={arrowY}
        r={2}
        fill="#FFFFFF"
      />
    </g>
  );
};

// 球体指示器组件
const MinimapBalls: React.FC = () => {
  const { ballPositions, currentColor } = useGameStore();
  
  return (
    <g>
      {ballPositions
        .filter(ball => !ball.collected)
        .map((ball) => {
          const [bx, , bz] = ball.position;
          const { x, y } = worldToMinimap(bx, bz);
          
          return (
            <g key={ball.id}>
              {/* 球体光环 */}
              <circle
                cx={x}
                cy={y}
                r={6}
                fill={BALL_COLORS[currentColor]}
                opacity={0.3}
              />
              {/* 球体核心 */}
              <circle
                cx={x}
                cy={y}
                r={3}
                fill={BALL_COLORS[currentColor]}
                stroke="#FFFFFF"
                strokeWidth={1}
              />
            </g>
          );
        })}
    </g>
  );
};

// 起始点指示器
const MinimapStartPoint: React.FC<{ startPoint?: [number, number, number] }> = ({ startPoint = [0, 0, 0] }) => {
  const [sx, , sz] = startPoint;
  const { x, y } = worldToMinimap(sx, sz);
  
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={5}
        fill="#10B981"
        opacity={0.6}
      />
      <circle
        cx={x}
        cy={y}
        r={3}
        fill="#34D399"
      />
    </g>
  );
};

// 小地图主组件
const MiniMap: React.FC = () => {
  const { gameStatus, collectedBalls, totalBalls, currentColor, customMazeConfig } = useGameStore();
  
  // 只在游戏进行中显示
  if (gameStatus !== 'playing') {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50">
      {/* 小地图容器 */}
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
        {/* 小地图标题 */}
        <div className="text-white text-sm font-semibold mb-2 text-center">
          小地图
        </div>
        
        {/* SVG小地图 */}
        <svg 
          width={MINIMAP_CONFIG.size} 
          height={MINIMAP_CONFIG.size}
          className="border border-gray-600 rounded bg-gray-800"
        >
          {/* 背景网格 */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* 迷宫墙体 */}
          {(customMazeConfig?.walls || MAZE_WALLS).map((wall, index) => (
            <MinimapWall
              key={index}
              position={wall.position}
              size={wall.size}
            />
          ))}
          
          {/* 起始点 */}
          <MinimapStartPoint startPoint={customMazeConfig?.playerStart} />
          
          {/* 球体 */}
          <MinimapBalls />
          
          {/* 玩家 */}
          <MinimapPlayer />
        </svg>
        
        {/* 游戏信息 */}
        <div className="mt-2 text-xs text-gray-300 space-y-1">
          <div className="flex justify-between items-center">
            <span>目标颜色:</span>
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-white/50"
                style={{ backgroundColor: BALL_COLORS[currentColor] }}
              />
              <span className="capitalize">{currentColor}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span>进度:</span>
            <span>{collectedBalls}/{totalBalls}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
            <div 
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${(collectedBalls / totalBalls) * 100}%`,
                backgroundColor: BALL_COLORS[currentColor]
              }}
            />
          </div>
        </div>
        
        {/* 控制提示 */}
        <div className="mt-2 text-xs text-gray-400 space-y-0.5">
          <div>WASD: 移动</div>
          <div>F: 收集球体</div>
          <div>R: 返回起点</div>
        </div>
      </div>
    </div>
  );
};

export default MiniMap;