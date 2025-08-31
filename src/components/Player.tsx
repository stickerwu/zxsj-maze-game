import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getValidPosition } from '../config/mazeConfig';
import * as THREE from 'three';

// 玩家控制逻辑组件（不再渲染3D内容）
const Player: React.FC = () => {
  // 获取游戏状态
  const {
    playerPosition,
    playerRotation,
    keys,
    updatePlayerPosition,
    updatePlayerRotation,
    gameStatus,
    customMazeConfig,
    threeSceneManager
  } = useGameStore();
  
  // MMO风格移动配置
  const moveSpeed = 0.08; // 移动速度
  const rotationSpeed = 0.05; // 旋转速度
  
  // 游戏循环
  useEffect(() => {
    let animationId: number;
    
    const gameLoop = () => {
      if (gameStatus !== 'playing') {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }
      
      // MMO风格控制：检查鼠标右键状态决定控制模式
      let hasMovement = false;
      let isMoving = false; // 用于动画系统
      let currentRotation = playerRotation[1]; // 当前角色朝向
      
      // 统一控制模式：角色朝向始终跟随相机视角
      if (keys.w || keys.s || keys.a || keys.d) {
        // 获取相机水平角度作为角色新朝向（反转修正）
        const cameraAngle = threeSceneManager?.getCameraHorizontalAngle() || 0;
        currentRotation = cameraAngle + Math.PI; // 反转角色朝向
        hasMovement = true;
        console.log('统一模式：角色朝向跟随相机角度（已反转）:', currentRotation);
        
        // 立即更新角色朝向
        updatePlayerRotation([playerRotation[0], currentRotation, playerRotation[2]]);
      }
       
       // 初始化新位置
        let newPosition = [...playerPosition] as [number, number, number];
        
        // A/D键左右平移（统一使用相机视角）
        if (keys.a || keys.d) {
          // 基于相机视角的左右平移
          const cameraAngle = threeSceneManager?.getCameraHorizontalAngle() || 0;
          const strafeAngle = cameraAngle + Math.PI / 2; // 90度偏移得到左右方向
          
          if (keys.a) {
            // A键：向左平移
            const moveX = Math.sin(strafeAngle) * moveSpeed;
            const moveZ = Math.cos(strafeAngle) * moveSpeed;
            newPosition[0] -= moveX;
            newPosition[2] -= moveZ;
            isMoving = true;
            console.log('左移，移动向量:', { x: -moveX, z: -moveZ });
          }
          if (keys.d) {
            // D键：向右平移
            const moveX = Math.sin(strafeAngle) * moveSpeed;
            const moveZ = Math.cos(strafeAngle) * moveSpeed;
            newPosition[0] += moveX;
            newPosition[2] += moveZ;
            isMoving = true;
            console.log('右移，移动向量:', { x: moveX, z: moveZ });
          }
        }
        
        // W/S键控制前进后退
      
      if (keys.w) {
        // W键：向前移动（统一使用相机视角）
        const moveAngle = threeSceneManager?.getCameraHorizontalAngle() || 0;
        const moveX = Math.sin(moveAngle) * moveSpeed;
        const moveZ = Math.cos(moveAngle) * moveSpeed;
        newPosition[0] -= moveX; // 反转X方向
        newPosition[2] -= moveZ; // 反转Z方向
        isMoving = true;
        console.log('前进，移动角度:', moveAngle, '移动向量:', { x: -moveX, z: -moveZ });
      }
      if (keys.s) {
        // S键：向后移动（统一使用相机视角）
        const moveAngle = threeSceneManager?.getCameraHorizontalAngle() || 0;
        const moveX = Math.sin(moveAngle) * moveSpeed;
        const moveZ = Math.cos(moveAngle) * moveSpeed;
        newPosition[0] += moveX; // 反转X方向
        newPosition[2] += moveZ; // 反转Z方向
        isMoving = true;
        console.log('后退，移动角度:', moveAngle, '移动向量:', { x: moveX, z: moveZ });
      }
      
      // 如果有移动，检查碰撞并更新位置
      if (keys.w || keys.s || keys.a || keys.d) {
        // 检查碰撞并获取有效位置
        const customWalls = customMazeConfig?.walls;
        const validPosition = getValidPosition(playerPosition, newPosition, 0.3, customWalls);
        
        // 更新玩家位置
        if (
          validPosition[0] !== playerPosition[0] ||
          validPosition[2] !== playerPosition[2]
        ) {
          updatePlayerPosition(validPosition);
        }
      }
      
      // 更新ThreeSceneManager中的玩家状态（包含动画状态）
      if (threeSceneManager) {
        threeSceneManager.updatePlayer(
          playerPosition,
          playerRotation,
          isMoving
        );
      }
      
      animationId = requestAnimationFrame(gameLoop);
    };
    
    animationId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameStatus, keys, playerPosition, playerRotation, updatePlayerPosition, updatePlayerRotation, customMazeConfig]);
  
  // 这个组件不再渲染任何3D内容，只处理游戏逻辑
  return null;
};

export default Player;