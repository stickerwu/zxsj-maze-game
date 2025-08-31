import React, { useEffect, useRef } from 'react';
import { ThreeSceneManager } from '../utils/ThreeSceneManager';
import { useGameStore } from '../store/gameStore';

// 主要的3D场景组件
interface MazeSceneProps {
  children?: React.ReactNode;
}

const MazeScene: React.FC<MazeSceneProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<ThreeSceneManager | null>(null);
  const {
    playerPosition,
    playerRotation,
    ballPositions,
    currentColor,
    gameStatus,
    customMazeConfig,
    updatePlayerRotation,
    setThreeSceneManager
  } = useGameStore();
  
  // 初始化Three.js场景
  useEffect(() => {
    if (containerRef.current && !sceneManagerRef.current) {
      sceneManagerRef.current = new ThreeSceneManager(containerRef.current);
      // 将场景管理器设置到store中，供其他组件使用
      setThreeSceneManager(sceneManagerRef.current);
    }
    
    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
        sceneManagerRef.current = null;
        // 清理store中的场景管理器引用
        setThreeSceneManager(null);
      }
    };
  }, [setThreeSceneManager]);
  
  // 更新玩家位置和旋转
  useEffect(() => {
    if (sceneManagerRef.current && gameStatus === 'playing') {
      sceneManagerRef.current.updatePlayer(playerPosition, playerRotation);
      sceneManagerRef.current.updateCamera(playerPosition, playerRotation);
    }
  }, [playerPosition, playerRotation, gameStatus]);
  
  // 更新球体
  useEffect(() => {
    if (sceneManagerRef.current && gameStatus === 'playing') {
      // 转换球体数据格式为ThreeSceneManager期望的格式
      const ballPositionsArray = ballPositions.map(ball => 
        ball.collected ? null : ball.position
      );
      sceneManagerRef.current.updateBalls(ballPositionsArray, currentColor);
    }
  }, [ballPositions, currentColor, gameStatus]);

  // 初始化球体（游戏开始时）
  useEffect(() => {
    if (sceneManagerRef.current && gameStatus === 'playing' && ballPositions.length > 0) {
      // 清除现有球体并创建新的球体
      ballPositions.forEach((ball, index) => {
        if (!ball.collected) {
          sceneManagerRef.current!.createBall(ball.id, ball.position, currentColor);
        }
      });
    }
  }, [gameStatus, currentColor]);
  
  // 更新自定义迷宫配置
  useEffect(() => {
    if (sceneManagerRef.current && customMazeConfig) {
      // 使用自定义墙体配置
      sceneManagerRef.current.updateWalls(customMazeConfig.walls);
    }
  }, [customMazeConfig]);
  
  return (
    <div className="w-full h-full" ref={containerRef}>
      {/* 原生Three.js场景将在这里渲染 */}
    </div>
  );
};

export default MazeScene;