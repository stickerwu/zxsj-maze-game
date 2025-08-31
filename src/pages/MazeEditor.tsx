import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Download, Upload, Play, Trash2, RotateCcw, Grid3X3, ZoomIn, ZoomOut, Square, Move, Eye, Grid, Circle, MapPin, Eraser } from 'lucide-react';
import { useGameStore, BallColor, MazeConfig } from '../store/gameStore';


// 编辑工具类型
type EditTool = 'wall' | 'ball' | 'start' | 'erase';

// 网格配置
const GRID_SIZE = 50; // 50x50网格
const CELL_SIZE = 12; // 基础单元格大小 - 适应50x50网格
const WORLD_SIZE = 25; // 世界坐标范围 -25 到 25
const MIN_ZOOM = 0.2; // 最小缩放 - 适应50x50网格
const MAX_ZOOM = 2.5; // 最大缩放

// 小球颜色配置
const BALL_COLORS: Record<BallColor, string> = {
  blue: '#3B82F6',
  yellow: '#EAB308',
  red: '#EF4444',
  green: '#10B981'
};

const BALL_COLOR_NAMES: Record<BallColor, string> = {
  blue: '蓝色',
  yellow: '黄色',
  red: '红色',
  green: '绿色'
};

// 迷宫编辑器组件
const MazeEditor: React.FC = () => {
  const navigate = useNavigate();
  const { setCustomMazeConfig } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  
  // 编辑状态
  const [selectedTool, setSelectedTool] = useState<EditTool>('wall');
  const [selectedBallColor, setSelectedBallColor] = useState<BallColor>('blue');
  const [showGrid, setShowGrid] = useState(true);
  
  // 视图状态
  const [zoom, setZoom] = useState(0.6); // 初始缩放 - 适应50x50网格
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // 绘制状态
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [lastDrawnCell, setLastDrawnCell] = useState<{ x: number; y: number } | null>(null);
  
  // 迷宫配置状态
  const [mazeConfig, setMazeConfig] = useState<MazeConfig>({
    walls: [],
    ballSpawns: {
      blue: [],
      yellow: [],
      red: [],
      green: []
    },
    playerStart: [0, 0.5, 0]
  });
  
  // 坐标转换函数
  const gridToWorld = useCallback((gridX: number, gridY: number): { x: number; z: number } => {
    const worldX = (gridX - GRID_SIZE / 2) * (WORLD_SIZE * 2 / GRID_SIZE);
    const worldZ = (gridY - GRID_SIZE / 2) * (WORLD_SIZE * 2 / GRID_SIZE);
    return { x: worldX, z: worldZ };
  }, []);
  
  const worldToGrid = useCallback((worldX: number, worldZ: number): { x: number; y: number } => {
    const gridX = Math.round((worldX / (WORLD_SIZE * 2 / GRID_SIZE)) + GRID_SIZE / 2);
    const gridY = Math.round((worldZ / (WORLD_SIZE * 2 / GRID_SIZE)) + GRID_SIZE / 2);
    return { x: gridX, y: gridY };
  }, []);
  
  const canvasToGrid = useCallback((canvasX: number, canvasY: number): { x: number; y: number } => {
    const adjustedX = (canvasX - panOffset.x) / zoom;
    const adjustedY = (canvasY - panOffset.y) / zoom;
    return {
      x: Math.floor(adjustedX / CELL_SIZE),
      y: Math.floor(adjustedY / CELL_SIZE)
    };
  }, [zoom, panOffset]);
  
  // 检查元素存在性
  const hasWallAt = useCallback((gridX: number, gridY: number): boolean => {
    const { x: worldX, z: worldZ } = gridToWorld(gridX, gridY);
    return mazeConfig.walls.some(wall => {
      const [wx, , wz] = wall.position;
      return Math.abs(wx - worldX) < 0.5 && Math.abs(wz - worldZ) < 0.5;
    });
  }, [mazeConfig.walls, gridToWorld]);
  
  const getBallAt = useCallback((gridX: number, gridY: number): BallColor | null => {
    const { x: worldX, z: worldZ } = gridToWorld(gridX, gridY);
    for (const [color, spawns] of Object.entries(mazeConfig.ballSpawns)) {
      const hasBall = spawns.some(([x, , z]) => 
        Math.abs(x - worldX) < 0.5 && Math.abs(z - worldZ) < 0.5
      );
      if (hasBall) return color as BallColor;
    }
    return null;
  }, [mazeConfig.ballSpawns, gridToWorld]);
  
  const isPlayerStartAt = useCallback((gridX: number, gridY: number): boolean => {
    const { x: worldX, z: worldZ } = gridToWorld(gridX, gridY);
    const [px, , pz] = mazeConfig.playerStart;
    return Math.abs(px - worldX) < 0.5 && Math.abs(pz - worldZ) < 0.5;
  }, [mazeConfig.playerStart, gridToWorld]);
  
  // 防抖绘制函数
  const debouncedDraw = useRef<NodeJS.Timeout | null>(null);
  
  // 绘制画布
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 保存状态并应用变换
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);
    
    // 绘制背景
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    
    // 绘制网格
    if (showGrid) {
      // 根据缩放级别调整网格线颜色和粗细
      const gridAlpha = Math.max(0.3, Math.min(0.8, zoom * 0.8));
      ctx.strokeStyle = `rgba(55, 65, 81, ${gridAlpha})`;
      ctx.lineWidth = Math.max(0.5, 1 / zoom);
      
      // 绘制主网格线
      for (let i = 0; i <= GRID_SIZE; i++) {
        // 每10格绘制粗线
        if (i % 10 === 0) {
          ctx.strokeStyle = `rgba(75, 85, 99, ${Math.min(1, gridAlpha * 1.5)})`;
          ctx.lineWidth = Math.max(1, 2 / zoom);
        } else {
          ctx.strokeStyle = `rgba(55, 65, 81, ${gridAlpha})`;
          ctx.lineWidth = Math.max(0.5, 1 / zoom);
        }
        
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }
    }
    
    // 绘制悬停效果
    if (hoveredCell && hoveredCell.x >= 0 && hoveredCell.x < GRID_SIZE && 
        hoveredCell.y >= 0 && hoveredCell.y < GRID_SIZE) {
      const { x, y } = hoveredCell;
      ctx.fillStyle = selectedTool === 'wall' ? 'rgba(220, 38, 38, 0.3)' :
                     selectedTool === 'ball' ? `${BALL_COLORS[selectedBallColor]}40` :
                     selectedTool === 'start' ? 'rgba(139, 92, 246, 0.3)' :
                     'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
    
    // 计算可见区域以优化渲染性能
    const canvasRect = canvas.getBoundingClientRect();
    const visibleStartX = Math.max(0, Math.floor(-panOffset.x / zoom / CELL_SIZE) - 1);
    const visibleEndX = Math.min(GRID_SIZE, Math.ceil((-panOffset.x + canvasRect.width) / zoom / CELL_SIZE) + 1);
    const visibleStartY = Math.max(0, Math.floor(-panOffset.y / zoom / CELL_SIZE) - 1);
    const visibleEndY = Math.min(GRID_SIZE, Math.ceil((-panOffset.y + canvasRect.height) / zoom / CELL_SIZE) + 1);
    
    // 只绘制可见区域内的元素
    for (let x = visibleStartX; x < visibleEndX; x++) {
      for (let y = visibleStartY; y < visibleEndY; y++) {
        const canvasX = x * CELL_SIZE;
        const canvasY = y * CELL_SIZE;
        
        // 绘制墙体
        if (hasWallAt(x, y)) {
          ctx.fillStyle = '#DC2626';
          ctx.fillRect(canvasX, canvasY, CELL_SIZE, CELL_SIZE);
          
          ctx.strokeStyle = '#B91C1C';
          ctx.lineWidth = 1 / zoom;
          ctx.strokeRect(canvasX, canvasY, CELL_SIZE, CELL_SIZE);
        }
        
        // 绘制小球
        const ballColor = getBallAt(x, y);
        if (ballColor) {
          const centerX = canvasX + CELL_SIZE / 2;
          const centerY = canvasY + CELL_SIZE / 2;
          const radius = CELL_SIZE * 0.3;
          
          ctx.fillStyle = BALL_COLORS[ballColor];
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2 / zoom;
          ctx.stroke();
        }
        
        // 绘制玩家起始点
        if (isPlayerStartAt(x, y)) {
          const centerX = canvasX + CELL_SIZE / 2;
          const centerY = canvasY + CELL_SIZE / 2;
          const radius = CELL_SIZE * 0.4;
          
          ctx.fillStyle = '#8B5CF6';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2 / zoom;
          
          // 绘制六角星
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = centerX + radius * Math.cos(angle);
            const py = centerY + radius * Math.sin(angle);
            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }
    
    ctx.restore();
  }, [showGrid, hoveredCell, selectedTool, selectedBallColor, hasWallAt, getBallAt, 
      isPlayerStartAt, zoom, panOffset, mazeConfig]);
  
  // 优化的绘制函数，使用防抖
  const optimizedDraw = useCallback(() => {
    if (debouncedDraw.current) {
      clearTimeout(debouncedDraw.current);
    }
    debouncedDraw.current = setTimeout(() => {
      drawCanvas();
    }, 16); // 约60fps
  }, [drawCanvas]);
  
  // 设置画布大小
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const updateCanvasSize = () => {
      const containerRect = container.getBoundingClientRect();
      canvas.width = containerRect.width - 32;
      canvas.height = containerRect.height - 32;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  // 添加或移除元素
  const addElement = useCallback((gridX: number, gridY: number) => {
    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
      return;
    }
    
    const { x: worldX, z: worldZ } = gridToWorld(gridX, gridY);
    
    setMazeConfig(prev => {
      const newConfig = { ...prev };
      
      if (selectedTool === 'wall') {
        // 检查是否已有墙体
        const existingWallIndex = newConfig.walls.findIndex(wall => {
          const [wx, , wz] = wall.position;
          return Math.abs(wx - worldX) < 0.5 && Math.abs(wz - worldZ) < 0.5;
        });
        
        if (existingWallIndex >= 0) {
          // 如果已有墙体，不做任何操作（避免重复添加）
        } else {
          // 移除该位置的小球和起点
          Object.keys(newConfig.ballSpawns).forEach(color => {
            newConfig.ballSpawns[color as BallColor] = newConfig.ballSpawns[color as BallColor].filter(
              ([x, , z]) => !(Math.abs(x - worldX) < 0.5 && Math.abs(z - worldZ) < 0.5)
            );
          });
          
          // 如果起点在此位置，移动起点
          const [px, py, pz] = newConfig.playerStart;
          if (Math.abs(px - worldX) < 0.5 && Math.abs(pz - worldZ) < 0.5) {
            newConfig.playerStart = [0, 0.5, 0];
          }
          
          // 添加墙体
          const newWall = {
            position: [worldX, 1, worldZ] as [number, number, number],
            size: [1, 2, 1] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number]
          };
          newConfig.walls.push(newWall);
        }
      } else if (selectedTool === 'ball') {
        console.log('🎯 Ball tool - Adding ball at:', { gridX, gridY, worldX, worldZ, selectedBallColor });
        
        // 检查是否已有小球
        let existingBallColor: BallColor | null = null;
        Object.entries(newConfig.ballSpawns).forEach(([color, spawns]) => {
          const ballIndex = spawns.findIndex(([x, , z]) => 
            Math.abs(x - worldX) < 0.5 && Math.abs(z - worldZ) < 0.5
          );
          if (ballIndex >= 0) {
            existingBallColor = color as BallColor;
            const [x, , z] = spawns[ballIndex];
            console.log('🔍 Found existing ball:', { color, position: [x, z] });
          }
        });
        
        // 检查是否有墙体
        const hasWall = newConfig.walls.some(wall => {
          const [wx, , wz] = wall.position;
          return Math.abs(wx - worldX) < 0.5 && Math.abs(wz - worldZ) < 0.5;
        });
        
        // 检查是否是起点
        const [px, py, pz] = newConfig.playerStart;
        const isStart = Math.abs(px - worldX) < 0.5 && Math.abs(pz - worldZ) < 0.5;
        
        console.log('🔍 Position checks:', { hasWall, isStart, existingBallColor });
        
        if (!hasWall && !isStart) {
          if (existingBallColor === selectedBallColor) {
            // 如果已有相同颜色的小球，不做任何操作（与墙体逻辑一致）
            console.log('⚠️ Same color ball already exists, skipping');
          } else {
            // 如果有其他颜色的小球，先移除它
            if (existingBallColor) {
              Object.entries(newConfig.ballSpawns).forEach(([color, spawns]) => {
                const ballIndex = spawns.findIndex(([x, , z]) => 
                  Math.abs(x - worldX) < 0.5 && Math.abs(z - worldZ) < 0.5
                );
                if (ballIndex >= 0) {
                   const [x, , z] = spawns[ballIndex];
                   spawns.splice(ballIndex, 1);
                   console.log('🗑️ Removed existing ball:', { color, position: [x, z] });
                 }
              });
            }
            
            // 添加新小球
            newConfig.ballSpawns[selectedBallColor].push([worldX, 0.5, worldZ]);
            console.log('✅ Added new ball:', { color: selectedBallColor, position: [worldX, worldZ] });
          }
        } else {
          console.log('❌ Cannot place ball - position blocked:', { hasWall, isStart });
        }
      } else if (selectedTool === 'start') {
        // 检查是否有墙体或小球
        const hasWall = newConfig.walls.some(wall => {
          const [wx, , wz] = wall.position;
          return Math.abs(wx - worldX) < 0.5 && Math.abs(wz - worldZ) < 0.5;
        });
        
        const hasBall = Object.values(newConfig.ballSpawns).some(spawns =>
          spawns.some(([x, , z]) => Math.abs(x - worldX) < 0.5 && Math.abs(z - worldZ) < 0.5)
        );
        
        if (!hasWall && !hasBall) {
          const [px, py, pz] = newConfig.playerStart;
          if (Math.abs(px - worldX) < 0.5 && Math.abs(pz - worldZ) < 0.5) {
            // 重复设置起点时移动到默认位置
            newConfig.playerStart = [0, 0.5, 0];
          } else {
            // 设置新起点
            newConfig.playerStart = [worldX, 0.5, worldZ];
          }
        }
      } else if (selectedTool === 'erase') {
        // 擦除所有元素
        // 移除墙体
        newConfig.walls = newConfig.walls.filter(wall => {
          const [wx, , wz] = wall.position;
          return !(Math.abs(wx - worldX) < 0.5 && Math.abs(wz - worldZ) < 0.5);
        });
        
        // 移除小球
        Object.keys(newConfig.ballSpawns).forEach(color => {
          newConfig.ballSpawns[color as BallColor] = newConfig.ballSpawns[color as BallColor].filter(
            ([x, , z]) => !(Math.abs(x - worldX) < 0.5 && Math.abs(z - worldZ) < 0.5)
          );
        });
        
        // 移除起点
        const [px, py, pz] = newConfig.playerStart;
        if (Math.abs(px - worldX) < 0.5 && Math.abs(pz - worldZ) < 0.5) {
          newConfig.playerStart = [0, 0.5, 0];
        }
      }
      
      return newConfig;
    });
  }, [selectedTool, selectedBallColor, gridToWorld]);
  
  // 鼠标事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (e.ctrlKey) {
      // Ctrl+点击开始平移
      setIsPanning(true);
      setLastPanPoint({ x, y });
    } else {
      // 开始绘制
      setIsDrawing(true);
      const gridPos = canvasToGrid(x, y);
      addElement(gridPos.x, gridPos.y);
      setLastDrawnCell(gridPos);
    }
  }, [canvasToGrid, addElement, selectedTool, selectedBallColor]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isPanning) {
      // 平移画布
      const deltaX = x - lastPanPoint.x;
      const deltaY = y - lastPanPoint.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint({ x, y });
    } else {
      // 更新悬停位置
      const gridPos = canvasToGrid(x, y);
      setHoveredCell(gridPos);
      
      // 拖拽连续绘制（支持所有工具）
      if (isDrawing) {
        if (!lastDrawnCell || 
            lastDrawnCell.x !== gridPos.x || 
            lastDrawnCell.y !== gridPos.y) {
          addElement(gridPos.x, gridPos.y);
          setLastDrawnCell(gridPos);
        }
      }
    }
  }, [isPanning, lastPanPoint, canvasToGrid, isDrawing, selectedTool, lastDrawnCell, addElement]);
  
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setIsDrawing(false);
    setLastDrawnCell(null);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    setIsPanning(false);
    setIsDrawing(false);
    setLastDrawnCell(null);
  }, []);
  
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    }
  }, []);
  
  // 配置导入导出
  const exportConfig = useCallback(() => {
    const configJson = JSON.stringify(mazeConfig, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maze-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [mazeConfig]);
  
  const importConfig = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          // 验证配置格式
          if (config.walls && config.ballSpawns && config.playerStart) {
            setMazeConfig(config);
            alert('配置导入成功！');
          } else {
            alert('配置文件格式不正确！');
          }
        } catch (error) {
          alert('配置文件解析失败！');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);
  
  // 测试迷宫
  const testMaze = useCallback(() => {
    // 验证迷宫配置
    const totalBalls = Object.values(mazeConfig.ballSpawns).reduce(
      (sum, spawns) => sum + spawns.length, 0
    );
    
    if (totalBalls === 0) {
      alert('请至少添加一个小球才能测试迷宫！');
      return;
    }
    
    // 设置自定义迷宫配置并跳转到游戏
    setCustomMazeConfig(mazeConfig);
    navigate('/');
  }, [mazeConfig, setCustomMazeConfig, navigate]);
  


  // 重绘画布
  useEffect(() => {
    optimizedDraw();
  }, [optimizedDraw]);
  
  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* 顶部说明区域 */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🛠️ 迷宫编辑器</h1>
              <p className="text-gray-300">设计和创建属于你自己的迷宫关卡</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              返回首页
            </button>
          </div>
          
          {/* 使用说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
              <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                <Square className="w-4 h-4" />
                工具使用
              </h3>
              <ul className="text-gray-300 space-y-1">
                <li>• <strong>墙体工具</strong>：点击网格绘制墙体</li>
                <li>• <strong>球体工具</strong>：放置不同颜色的收集球</li>
                <li>• <strong>起点工具</strong>：设置玩家起始位置</li>
                <li>• <strong>擦除工具</strong>：删除已放置的元素</li>
              </ul>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-500/30">
              <h3 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                <Move className="w-4 h-4" />
                视图操作
              </h3>
              <ul className="text-gray-300 space-y-1">
                <li>• <strong>缩放</strong>：Ctrl + 鼠标滚轮</li>
                <li>• <strong>平移</strong>：Ctrl + 鼠标拖拽</li>
                <li>• <strong>网格</strong>：切换网格线显示</li>
                <li>• <strong>重置</strong>：恢复默认视图</li>
              </ul>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                设计建议
              </h3>
              <ul className="text-gray-300 space-y-1">
                <li>• 确保起点到所有球体都有路径</li>
                <li>• 合理分布不同颜色的球体</li>
                <li>• 避免创建无法到达的区域</li>
                <li>• 使用测试功能验证迷宫</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div className="flex-1 flex">
        {/* 左侧工具栏 */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* 标题 */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">工具面板</h2>
              <p className="text-sm text-gray-400">选择编辑工具开始设计</p>
            </div>
          
          {/* 编辑工具 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">编辑工具</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  console.log('🔧 Tool selected:', { from: selectedTool, to: 'wall' });
                  setSelectedTool('wall');
                  console.log('✅ Tool state updated to:', 'wall');
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedTool === 'wall'
                    ? 'border-red-500 bg-red-500/20 text-red-300'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <Grid className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">墙体</span>
              </button>
              
              <button
                onClick={() => {
                  console.log('🔧 Tool selected:', { from: selectedTool, to: 'ball' });
                  setSelectedTool('ball');
                  console.log('✅ Tool state updated to:', 'ball');
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedTool === 'ball'
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-current" />
                <span className="text-xs">小球</span>
              </button>
              
              <button
                onClick={() => {
                  console.log('🔧 Tool selected:', { from: selectedTool, to: 'start' });
                  setSelectedTool('start');
                  console.log('✅ Tool state updated to:', 'start');
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedTool === 'start'
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <Home className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">起点</span>
              </button>
              
              <button
                onClick={() => {
                  console.log('🔧 Tool selected:', { from: selectedTool, to: 'erase' });
                  setSelectedTool('erase');
                  console.log('✅ Tool state updated to:', 'erase');
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedTool === 'erase'
                    ? 'border-red-500 bg-red-500/20 text-red-300'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <RotateCcw className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">擦除</span>
              </button>
            </div>
          </div>
          
          {/* 小球颜色选择 */}
          {selectedTool === 'ball' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">小球颜色</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(BALL_COLORS).map(([color, hex]) => (
                  <button
                    key={color}
                    onClick={() => {
                      console.log('🎨 Ball color selected:', { from: selectedBallColor, to: color });
                      setSelectedBallColor(color as BallColor);
                      setSelectedTool('ball');
                      console.log('✅ Ball color and tool updated:', { color, tool: 'ball' });
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedBallColor === color
                        ? 'border-white bg-gray-700'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div
                      className="w-6 h-6 mx-auto mb-1 rounded-full border-2 border-white"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-xs text-gray-300">
                      {BALL_COLOR_NAMES[color as BallColor]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 视图控制 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">视图控制</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">缩放: {zoom.toFixed(1)}x</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - 0.2))}
                    className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
                    disabled={zoom <= MIN_ZOOM}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + 0.2))}
                    className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
                    disabled={zoom >= MAX_ZOOM}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setZoom(1.0);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="w-full p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                重置视图
              </button>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300 text-sm">显示网格</span>
              </label>
              

            </div>
          </div>
          
          {/* 统计信息 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">统计信息</h3>
            <div className="bg-gray-700 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>墙体数量:</span>
                <span className="text-white">{mazeConfig.walls.length}</span>
              </div>
              {Object.entries(mazeConfig.ballSpawns).map(([color, spawns]) => (
                <div key={color} className="flex justify-between text-gray-300">
                  <span>{BALL_COLOR_NAMES[color as BallColor]}小球:</span>
                  <span className="text-white">{spawns.length}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 操作按钮 */}
           <div className="space-y-3">
             <h3 className="text-lg font-semibold text-white">操作</h3>
             <div className="space-y-2">
               <button
                 onClick={exportConfig}
                 className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
               >
                 <Download className="w-4 h-4" />
                 导出配置
               </button>
               
               <button
                 onClick={importConfig}
                 className="w-full p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
               >
                 <Upload className="w-4 h-4" />
                 导入配置
               </button>
               
               <button
                 onClick={testMaze}
                 className="w-full p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
               >
                 <Play className="w-4 h-4" />
                 测试迷宫
               </button>
               
               <button
                 onClick={() => {
                   setMazeConfig({
                     walls: [],
                     ballSpawns: { blue: [], yellow: [], red: [], green: [] },
                     playerStart: [0, 0.5, 0]
                   });
                 }}
                 className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
               >
                 <RotateCcw className="w-4 h-4" />
                 清空迷宫
               </button>
               
             </div>
           </div>
        </div>
      </div>
      
      {/* 右侧画布区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-white">迷宫设计画布</h2>
              <span className="text-sm text-gray-400">
                当前工具: {selectedTool === 'wall' ? '墙体编辑' : 
                          selectedTool === 'ball' ? `小球放置 (${BALL_COLOR_NAMES[selectedBallColor]})` : 
                          selectedTool === 'start' ? '起点设置' : '擦除模式'}
              </span>
            </div>
          </div>
        </div>
        
        {/* 画布容器 */}
        <div className="flex-1 overflow-hidden bg-gray-900 p-4">
          <div ref={containerRef} className="w-full h-full flex items-center justify-center">
            <canvas
               ref={canvasRef}
               className="border border-gray-600 cursor-crosshair"
               style={{
                 cursor: isPanning ? 'grabbing' : 
                        selectedTool === 'wall' ? 'crosshair' :
                        selectedTool === 'ball' ? 'copy' :
                        selectedTool === 'start' ? 'pointer' : 'not-allowed'
               }}
               onMouseDown={handleMouseDown}
               onMouseMove={handleMouseMove}
               onMouseUp={handleMouseUp}
               onMouseLeave={handleMouseLeave}
               onWheel={handleWheel}
             />
          </div>
        </div>
        
        {/* 底部提示 */}
        <div className="bg-gray-800 border-t border-gray-700 p-3">
          <div className="text-center text-sm text-gray-400">
            <span className="mr-4">💡 提示: 点击网格添加元素</span>
            <span className="mr-4">🔍 Ctrl+滚轮缩放</span>
            <span className="mr-4">✋ Ctrl+拖拽平移</span>
            <span>📐 网格大小: 40×40</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default MazeEditor;