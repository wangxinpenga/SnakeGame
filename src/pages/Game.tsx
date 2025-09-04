import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameEngine } from '../hooks/useGameEngine';
import { useGameRenderer } from '../hooks/useGameRenderer';
import { useGameKeyboard, useTouchControl } from '../hooks/useKeyboard';
import { audioManager } from '../utils/audioUtils';
import { Direction } from '../types/game';
import { Pause, Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

const Game: React.FC = () => {
  const navigate = useNavigate();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // 游戏引擎
  const {
    gameState,
    settings,
    gameTime,
    initGame,
    startGame,
    stopGame,
    togglePause,
    restartGame,
    handleGameEvent,
    updateSettings
  } = useGameEngine();

  // 游戏渲染器
  const {
    canvasRef,
    initCanvas,
    render,
    addParticleEffect
  } = useGameRenderer(settings.theme);

  // 键盘控制
  const handleMove = (direction: Direction) => {
    handleGameEvent({ type: 'MOVE', direction });
  };

  const handlePause = () => {
    togglePause();
  };

  const handleRestart = () => {
    restartGame();
  };

  useGameKeyboard(handleMove, handlePause, handleRestart);
  useTouchControl(handleMove);

  // 初始化游戏
  useEffect(() => {
    initCanvas();
    initGame();
    
    // 初始化音频管理器
    // 初始化音频设置
    audioManager.setVolume(settings.soundEnabled ? settings.volume : 0);
    audioManager.resumeAudioContext();
    
    // 开始游戏
    setTimeout(() => {
      startGame();
    }, 500);

    return () => {
      stopGame();
      audioManager.stopBackgroundMusic();
    };
  }, []);

  // 渲染游戏画面
  useEffect(() => {
    const renderLoop = () => {
      render(gameState, gameTime);
      requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
  }, [gameState, gameTime, render]);

  // 监听游戏状态变化，添加粒子效果
  useEffect(() => {
    if (gameState.gameStatus === 'gameOver') {
      // 游戏结束后跳转到结束页面
      setTimeout(() => {
        navigate('/gameover', { 
          state: { 
            score: gameState.score, 
            level: gameState.level, 
            time: gameTime 
          } 
        });
      }, 2000);
    }
  }, [gameState.gameStatus, gameState.score, gameState.level, gameTime, navigate]);

  // 处理音频切换
  const toggleAudio = () => {
    const newAudioState = !isAudioEnabled;
    setIsAudioEnabled(newAudioState);
    audioManager.setVolume(newAudioState ? settings.volume : 0);
    
    if (newAudioState) {
      audioManager.playBackgroundMusic();
    } else {
      audioManager.stopBackgroundMusic();
    }
  };

  // 返回主菜单
  const goHome = () => {
    stopGame();
    navigate('/');
  };

  // 显示/隐藏控制面板
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  return (
    <div 
      ref={gameContainerRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col items-center justify-center p-4"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* 游戏标题 */}
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-center">
          贪吃蛇游戏
        </h1>
      </div>

      {/* 游戏画布容器 */}
      <div className="relative">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="border-2 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-400/20"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          }}
        />

        {/* 游戏控制面板 */}
        <div className={`absolute top-4 right-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex flex-col gap-2">
            {/* 暂停/继续按钮 */}
            <button
              onClick={togglePause}
              className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-cyan-400/30"
              title={gameState.gameStatus === 'playing' ? '暂停游戏' : '继续游戏'}
            >
              {gameState.gameStatus === 'playing' ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* 重新开始按钮 */}
            <button
              onClick={handleRestart}
              className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-green-400/30"
              title="重新开始"
            >
              <RotateCcw size={20} />
            </button>

            {/* 音频切换按钮 */}
            <button
              onClick={toggleAudio}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-purple-400/30"
              title={isAudioEnabled ? '关闭音效' : '开启音效'}
            >
              {isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            {/* 返回主菜单按钮 */}
            <button
              onClick={goHome}
              className="p-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-red-400/30"
              title="返回主菜单"
            >
              <Home size={20} />
            </button>
          </div>
        </div>

        {/* 游戏状态覆盖层 */}
        {gameState.gameStatus === 'gameOver' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h2 className="text-6xl font-bold text-red-400 mb-4 animate-pulse">
                游戏结束
              </h2>
              <p className="text-2xl text-white mb-2">最终分数: {gameState.score}</p>
              <p className="text-xl text-gray-300 mb-6">等级: {gameState.level}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                >
                  重新开始
                </button>
                <button
                  onClick={goHome}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
                >
                  返回主菜单
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 游戏信息面板 */}
      <div className="mt-6 grid grid-cols-3 gap-6 text-center">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4">
          <h3 className="text-cyan-400 font-semibold mb-2">分数</h3>
          <p className="text-2xl font-bold text-white">{gameState.score}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4">
          <h3 className="text-purple-400 font-semibold mb-2">等级</h3>
          <p className="text-2xl font-bold text-white">{gameState.level}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-2">时间</h3>
          <p className="text-2xl font-bold text-white">
            {Math.floor(gameTime / 60).toString().padStart(2, '0')}:
            {(gameTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* 操作提示 */}
      <div className="mt-6 text-center text-gray-400">
        <p className="mb-2">使用方向键或 WASD 控制蛇的移动</p>
        <p className="mb-2">按空格键暂停/继续游戏</p>
        <p>按 R 键重新开始游戏</p>
      </div>

      {/* 移动端虚拟按键 */}
      <div className="md:hidden mt-6">
        <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
          <div></div>
          <button
            onTouchStart={() => handleMove('up')}
            className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg active:scale-95 transition-transform"
          >
            ↑
          </button>
          <div></div>
          
          <button
            onTouchStart={() => handleMove('left')}
            className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg active:scale-95 transition-transform"
          >
            ←
          </button>
          <button
            onClick={togglePause}
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg active:scale-95 transition-transform"
          >
            {gameState.gameStatus === 'playing' ? '⏸' : '▶'}
          </button>
          <button
            onTouchStart={() => handleMove('right')}
            className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg active:scale-95 transition-transform"
          >
            →
          </button>
          
          <div></div>
          <button
            onTouchStart={() => handleMove('down')}
            className="p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg active:scale-95 transition-transform"
          >
            ↓
          </button>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Game;