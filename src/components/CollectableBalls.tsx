import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

// 可收集球体逻辑组件（不再渲染3D内容）
const CollectableBalls: React.FC = () => {
  // 获取游戏状态
  const {
    ballPositions,
    playerPosition,
    collectBall,
    gameStatus,
    keys
  } = useGameStore();
  
  // 当前可收集的球体ID
  const [nearbyBallId, setNearbyBallId] = useState<string | null>(null);
  
  // 检测附近的球体
  useEffect(() => {
    let animationId: number;
    
    const checkNearbyBalls = () => {
      if (gameStatus !== 'playing') {
        setNearbyBallId(null);
        animationId = requestAnimationFrame(checkNearbyBalls);
        return;
      }
      
      let foundNearbyBall: string | null = null;
      
      // 检查是否有球体在附近
      ballPositions.forEach((ballPos) => {
        if (ballPos && !ballPos.collected) {
          const distance = Math.sqrt(
            Math.pow(playerPosition[0] - ballPos.position[0], 2) +
            Math.pow(playerPosition[2] - ballPos.position[2], 2)
          );
          
          // 如果玩家靠近球体（距离小于1.2），标记为可收集
          if (distance < 1.2) {
            foundNearbyBall = ballPos.id;
          }
        }
      });
      
      setNearbyBallId(foundNearbyBall);
      animationId = requestAnimationFrame(checkNearbyBalls);
    };
    
    animationId = requestAnimationFrame(checkNearbyBalls);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameStatus, ballPositions, playerPosition]);
  
  // 处理F键收集
  useEffect(() => {
    if (keys.f && nearbyBallId) {
      collectBall(nearbyBallId);
      setNearbyBallId(null); // 收集后清除提示
    }
  }, [keys.f, nearbyBallId, collectBall]);
  
  // 渲染收集提示
  if (nearbyBallId && gameStatus === 'playing') {
    return (
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="bg-black/80 text-white px-6 py-3 rounded-lg border-2 border-yellow-400 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">按 F 收集小球</span>
            <div className="w-8 h-8 bg-yellow-400 text-black rounded flex items-center justify-center font-bold">
              F
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

export default CollectableBalls;