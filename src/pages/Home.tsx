import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Settings, Trophy, Info } from 'lucide-react';
import { particleUtils } from '../utils/particleUtils';
import { Particle } from '../types/game';
import { audioManager } from '../utils/audioUtils';
import { storageUtils } from '../utils/gameUtils';

export default function Home() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [stars, setStars] = useState<Particle[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    // 加载最高分
    const stats = storageUtils.loadStatistics();
    setHighScore(stats.highScore);

    // 初始化背景动画
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 创建星空背景
    const starField = particleUtils.createStarField(canvas, ctx, 150);
    setStars(starField);

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f0f23');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 更新和渲染星空
      particleUtils.updateStarField(starField, canvas);
      particleUtils.renderStarField(starField, ctx);
      
      // 绘制网格效果
      particleUtils.renderGrid(ctx, canvas, 50, 'rgba(0, 255, 136, 0.1)');
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    
    // 延迟显示内容以创建加载效果
    setTimeout(() => setIsLoaded(true), 500);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleStartGame = () => {
    audioManager.playSound('move');
    audioManager.resumeAudioContext();
    navigate('/game');
  };

  const handleSettings = () => {
    audioManager.playSound('pause');
    navigate('/settings');
  };

  const handleScores = () => {
    audioManager.playSound('pause');
    navigate('/scores');
  };

  const handleAbout = () => {
    audioManager.playSound('pause');
    // 显示游戏说明
    alert('🐍 华丽贪吃蛇游戏\n\n使用方向键或WASD控制蛇的移动\n吃掉金色食物获得分数\n避免撞到墙壁或自己\n\n享受游戏吧！');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* 背景画布 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />
      
      {/* 主要内容 */}
      <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-4 transition-all duration-1000 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* 游戏标题 */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
            🐍 SNAKE
          </h1>
          <div className="text-2xl md:text-3xl font-semibold text-green-400 mb-2 neon-text">
            华丽贪吃蛇
          </div>
          <div className="text-lg text-gray-300 opacity-80">
            体验最炫酷的贪吃蛇游戏
          </div>
          
          {/* 最高分显示 */}
          {highScore > 0 && (
            <div className="mt-4 text-yellow-400 text-xl font-bold neon-text">
              🏆 最高分: {highScore}
            </div>
          )}
        </div>

        {/* 菜单按钮 */}
        <div className="flex flex-col space-y-4 w-full max-w-md">
          <button
            onClick={handleStartGame}
            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-4 px-8 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-button"
          >
            <div className="flex items-center justify-center space-x-3">
              <Play className="w-6 h-6" />
              <span className="text-xl">开始游戏</span>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={handleSettings}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-button"
          >
            <div className="flex items-center justify-center space-x-3">
              <Settings className="w-6 h-6" />
              <span className="text-xl">游戏设置</span>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={handleScores}
            className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-button"
          >
            <div className="flex items-center justify-center space-x-3">
              <Trophy className="w-6 h-6" />
              <span className="text-xl">分数排行</span>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={handleAbout}
            className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-8 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl neon-button"
          >
            <div className="flex items-center justify-center space-x-3">
              <Info className="w-5 h-5" />
              <span className="text-lg">游戏说明</span>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* 版权信息 */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2024 华丽贪吃蛇游戏 - 享受游戏乐趣</p>
        </div>
      </div>

      {/* 自定义样式 */}
      <style>{`
        .neon-text {
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
        }
        
        .neon-button {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
        }
        
        .neon-button:hover {
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.4);
        }
        
        @keyframes glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}