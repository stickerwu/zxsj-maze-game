import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

// 键盘控制Hook
export const useKeyboardControls = () => {
  const { 
    setKeyPressed, 
    resetPlayerPosition, 
    gameStatus,
    keys 
  } = useGameStore();
  
  useEffect(() => {
    // 处理按键按下事件
    const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    console.log(`[Info] 按键按下: ${key}, 当前游戏状态: ${gameStatus}`);
    
    // 只在游戏进行中处理移动按键
    if (gameStatus === 'playing') {
      switch (key) {
        case 'w':
        case 'arrowup':
          event.preventDefault();
          console.log(`[Info] W键按下，设置按键状态为true`);
          setKeyPressed('w', true);
          break;
        case 'a':
        case 'arrowleft':
          event.preventDefault();
          console.log(`[Info] A键按下，设置按键状态为true`);
          setKeyPressed('a', true);
          break;
        case 's':
        case 'arrowdown':
          event.preventDefault();
          console.log(`[Info] S键按下，设置按键状态为true`);
          setKeyPressed('s', true);
          break;
        case 'd':
        case 'arrowright':
          event.preventDefault();
          console.log(`[Info] D键按下，设置按键状态为true`);
          setKeyPressed('d', true);
          break;
        case 'f':
          event.preventDefault();
          setKeyPressed('f', true);
          break;
        case 'r':
          event.preventDefault();
          setKeyPressed('r', true);
          // R键立即重置玩家位置
          resetPlayerPosition();
          break;
      }
    } else {
      console.log(`[Info] 游戏状态不是playing，忽略按键: ${key}`);
    }
  };
    
    // 处理按键释放事件
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      switch (key) {
        case 'w':
        case 'arrowup':
          console.log('W键释放');
          setKeyPressed('w', false);
          break;
        case 'a':
        case 'arrowleft':
          console.log('A键释放');
          setKeyPressed('a', false);
          break;
        case 's':
        case 'arrowdown':
          console.log('S键释放');
          setKeyPressed('s', false);
          break;
        case 'd':
        case 'arrowright':
          console.log('D键释放');
          setKeyPressed('d', false);
          break;
        case 'f':
          setKeyPressed('f', false);
          break;
        case 'r':
          setKeyPressed('r', false);
          break;
      }
    };
    
    // 添加事件监听器
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // 清理函数
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setKeyPressed, resetPlayerPosition, gameStatus]);
  
  // 返回当前按键状态（供其他组件使用）
  return {
    keys,
    gameStatus
  };
};

// 键盘控制组件（用于在React组件中使用）
export const KeyboardControls: React.FC = () => {
  useKeyboardControls();
  return null;
};