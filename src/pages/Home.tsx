import React from 'react';
import { useGameStore } from '../store/gameStore';
import MazeScene from '../components/MazeScene';
import Player from '../components/Player';
import CollectableBalls from '../components/CollectableBalls';
import MiniMap from '../components/MiniMap';
import GameUI from '../components/GameUI';
import { KeyboardControls } from '../hooks/useKeyboardControls';
import { Gamepad2, Edit3, Eye, Zap } from 'lucide-react';

const Home: React.FC = () => {
  const { gameStatus } = useGameStore();

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      {/* 键盘控制系统 */}
      <KeyboardControls />
      
      {/* 游戏UI界面 */}
      <GameUI />
      
      {/* 小地图 */}
      <MiniMap />
      
      {/* 3D场景 */}
      {gameStatus === 'playing' && (
        <div className="w-full h-full">
          {/* 原生Three.js场景 */}
          <MazeScene />
          
          {/* 玩家逻辑控制 */}
          <Player />
          
          {/* 可收集球体逻辑 */}
          <CollectableBalls />
        </div>
      )}
      
      {/* 非游戏状态时的背景和功能介绍 */}
      {gameStatus !== 'playing' && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          {/* 功能特色展示 */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {/* 3D游戏体验 */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">沉浸式3D体验</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  真实的3D迷宫环境，支持自由视角控制，带来身临其境的游戏体验
                </p>
              </div>
              
              {/* 迷宫编辑器 */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit3 className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">自定义编辑器</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  强大的可视化编辑工具，轻松设计属于你的迷宫关卡和挑战
                </p>
              </div>
              
              {/* 实时小地图 */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">智能导航</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  实时小地图显示，帮助你掌握全局视野，制定最佳探索策略
                </p>
              </div>
              
              {/* 流畅操作 */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">流畅操控</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  优化的WASD移动控制，鼠标视角操作，带来丝滑的游戏手感
                </p>
              </div>
            </div>
            
            {/* 操作提示 */}
            <div className="mt-8 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-500/30">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">🎮 操作指南</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-2">
                    <span className="text-white font-mono text-lg">WASD</span>
                  </div>
                  <p className="text-gray-300">角色移动</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-2">
                    <span className="text-white font-mono text-lg">鼠标右键</span>
                  </div>
                  <p className="text-gray-300">拖拽旋转视角</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-2">
                    <span className="text-white font-mono text-lg">滚轮</span>
                  </div>
                  <p className="text-gray-300">调整视角距离</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-700/50 rounded-lg p-3 mb-2">
                    <span className="text-white font-mono text-lg">F键</span>
                  </div>
                  <p className="text-gray-300">收集球体</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;