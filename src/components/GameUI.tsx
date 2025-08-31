import React from 'react';
import { useGameStore, BallColor } from '../store/gameStore';

// 球体颜色配置
const BALL_COLORS = {
  blue: '#3B82F6',
  yellow: '#EAB308',
  red: '#EF4444',
  green: '#10B981'
} as const;

// 球体颜色中文名称
const BALL_COLOR_NAMES = {
  blue: '蓝色',
  yellow: '黄色',
  red: '红色',
  green: '绿色'
} as const;

// 开始界面组件
const StartScreen: React.FC = () => {
  const { startGame } = useGameStore();
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
      {/* 背景动画效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* 主内容 */}
      <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-6">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            噩梦潜渊古龙陵萧行云P2内场模拟器
          </h1>
          <p className="text-xl text-gray-300 mb-2">P2迷宫模拟器</p>
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
        </div>
        
        {/* 游戏说明 */}
        <div className="mb-8 space-y-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">游戏介绍</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              欢迎来到噩梦潜渊古龙陵萧行云P2内场模拟器！这是一个专为P2阶段设计的3D迷宫训练环境。
              在这个神秘的虚空迷宫中，你需要收集所有指定颜色的能量球体来完成挑战。
              每次游戏会随机选择一种颜色作为目标，找到并收集所有该颜色的球体即可获胜！
            </p>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">操作说明</h2>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-700 rounded text-sm font-mono">W</kbd>
                  <span className="text-gray-300">向前移动</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-700 rounded text-sm font-mono">S</kbd>
                  <span className="text-gray-300">向后移动</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-700 rounded text-sm font-mono">A</kbd>
                  <span className="text-gray-300">向左平移</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-700 rounded text-sm font-mono">D</kbd>
                  <span className="text-gray-300">向右平移</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-700 rounded text-sm font-mono">F</kbd>
                  <span className="text-gray-300">收集球体</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-700 rounded text-sm font-mono">R</kbd>
                  <span className="text-gray-300">返回起点</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-700 rounded text-sm font-mono">鼠标右键拖拽</kbd>
                  <span className="text-gray-300">旋转视角</span>
                </div>
                <div className="flex items-center gap-3">
                  <kbd className="px-3 py-1 bg-gray-700 rounded text-sm font-mono">滚轮</kbd>
                  <span className="text-gray-300">缩放视角</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 功能介绍 */}
        <div className="mb-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-300">功能模块</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-purple-300">🎮 游戏模式</h3>
                <p className="text-gray-300 text-sm">
                  进入3D迷宫世界，体验沉浸式的探索与收集挑战。随机生成的迷宫布局和目标颜色，每次都有全新的游戏体验。
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-orange-300">🛠️ 迷宫编辑器</h3>
                <p className="text-gray-300 text-sm">
                  自定义迷宫设计工具，可以创建、编辑和保存自己的迷宫布局。支持墙体绘制、球体放置和起点设定等功能。
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={startGame}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 min-w-[200px]"
          >
            <span className="relative z-10">🎮 开始探索</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <button
            onClick={() => window.location.href = '/editor'}
            className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25 min-w-[200px]"
          >
            <span className="relative z-10">🛠️ 迷宫编辑器</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
        
        {/* 按钮说明 */}
        <div className="mt-4 text-sm text-gray-400 space-y-1">
          <p>💡 <strong>游戏模式</strong>：立即开始迷宫探索，收集指定颜色的能量球体</p>
          <p>💡 <strong>编辑器模式</strong>：设计和创建属于你自己的迷宫关卡</p>
        </div>
        
        {/* 版本信息 */}
        <div className="mt-8 text-sm text-gray-500">
          <p>噩梦潜渊古龙陵萧行云P2内场模拟器 v1.0 | 使用 React + Three.js 构建</p>
        </div>
      </div>
    </div>
  );
};

// 成功界面组件
const SuccessScreen: React.FC = () => {
  const { resetGame, currentColor, collectedBalls, totalBalls } = useGameStore();
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center z-50">
      {/* 庆祝动画背景 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 粒子效果 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* 主内容 */}
      <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-6">
        {/* 成功标题 */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            恭喜通关！
          </h1>
          <p className="text-xl text-gray-300">你成功收集了所有目标球体</p>
        </div>
        
        {/* 游戏统计 */}
        <div className="mb-8">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-green-500/30">
            <h2 className="text-2xl font-semibold mb-4 text-green-300">游戏统计</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">目标颜色:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/50"
                    style={{ backgroundColor: BALL_COLORS[currentColor] }}
                  />
                  <span className="text-white font-semibold">{BALL_COLOR_NAMES[currentColor]}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">收集进度:</span>
                <span className="text-white font-semibold">{collectedBalls}/{totalBalls}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: '100%',
                    backgroundColor: BALL_COLORS[currentColor]
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="space-y-4">
          <button
            onClick={resetGame}
            className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 w-full sm:w-auto"
          >
            <span className="relative z-10">再次挑战</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <p className="text-sm text-gray-400">
            每次游戏都会随机生成新的迷宫布局和目标颜色
          </p>
        </div>
      </div>
    </div>
  );
};

// 游戏中的HUD界面
const GameHUD: React.FC = () => {
  const { gameStatus, currentColor, collectedBalls, totalBalls } = useGameStore();
  
  if (gameStatus !== 'playing') {
    return null;
  }
  
  return (
    <>
      {/* 左上角游戏信息 */}
      <div className="fixed top-4 left-4 z-40">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 text-white">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">目标颜色:</span>
              <div className="flex items-center gap-1">
                <div 
                  className="w-4 h-4 rounded-full border border-white/50"
                  style={{ backgroundColor: BALL_COLORS[currentColor] }}
                />
                <span className="text-sm font-semibold">{BALL_COLOR_NAMES[currentColor]}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">进度:</span>
              <span className="text-sm font-semibold">{collectedBalls}/{totalBalls}</span>
            </div>
            <div className="w-32 bg-gray-700 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(collectedBalls / totalBalls) * 100}%`,
                  backgroundColor: BALL_COLORS[currentColor]
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部控制提示 */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3 border border-purple-500/30">
          <div className="flex items-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">W</kbd>
              <span>前进</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">S</kbd>
              <span>后退</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">A</kbd>
              <span>左移</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">D</kbd>
              <span>右移</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">F</kbd>
              <span>收集</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">R</kbd>
              <span>重置</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">右键拖拽</kbd>
              <span>旋转视角</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs font-mono">滚轮</kbd>
              <span>缩放</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 主UI组件
const GameUI: React.FC = () => {
  const { gameStatus } = useGameStore();
  
  return (
    <>
      {gameStatus === 'start' && <StartScreen />}
      {gameStatus === 'success' && <SuccessScreen />}
      {gameStatus === 'playing' && <GameHUD />}
    </>
  );
};

export default GameUI;