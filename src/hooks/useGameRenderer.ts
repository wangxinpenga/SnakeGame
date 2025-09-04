import { useRef, useCallback, useEffect } from 'react';
import { GameState, Position, RenderContext, Theme } from '../types/game';
import { GAME_CONFIG, THEME_COLORS, PARTICLE_CONFIG } from '../constants/game';
import { ParticleSystem } from '../utils/particleUtils';
import { particleUtils } from '../utils/particleUtils';

// 游戏渲染引擎Hook
export const useGameRenderer = (theme: Theme = 'neon') => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const starsRef = useRef<any[]>([]);
  const lastRenderTimeRef = useRef<number>(0);

  // 初始化Canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置Canvas尺寸
    canvas.width = GAME_CONFIG.canvasWidth;
    canvas.height = GAME_CONFIG.canvasHeight;

    // 设置渲染上下文
    ctx.imageSmoothingEnabled = false;
    contextRef.current = ctx;

    // 初始化粒子系统
    if (canvasRef.current && ctx) {
      particleSystemRef.current = new ParticleSystem(canvasRef.current, ctx);
    }

    // 初始化星空背景
    if (canvasRef.current && ctx) {
      starsRef.current = particleUtils.createStarField(canvasRef.current, ctx, 50);
    }
  }, []);

  // 清空Canvas
  const clearCanvas = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }, []);

  // 渲染背景
  const renderBackground = useCallback((deltaTime: number) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    const colors = THEME_COLORS[theme];

    // 渲染渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.canvasHeight);
    gradient.addColorStop(0, colors.background);
    gradient.addColorStop(1, colors.background);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

    // 渲染星空
    if (canvasRef.current) {
      particleUtils.updateStarField(starsRef.current, canvasRef.current);
      particleUtils.renderStarField(starsRef.current, ctx);
    }

    // 渲染网格
    if (canvasRef.current) {
      particleUtils.renderGrid(ctx, canvasRef.current, GAME_CONFIG.gridSize);
    }
  }, [theme]);

  // 渲染蛇身
  const renderSnake = useCallback((snake: Position[], direction: string) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    const colors = THEME_COLORS[theme];
    const gridSize = GAME_CONFIG.gridSize;

    snake.forEach((segment, index) => {
      const x = segment.x * gridSize;
      const y = segment.y * gridSize;

      // 蛇头特殊处理
      if (index === 0) {
        // 蛇头发光效果
        ctx.shadowColor = colors.snakeGlow;
        ctx.shadowBlur = 15;
        
        // 渲染蛇头
        ctx.fillStyle = colors.snake;
        ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
        
        // 渲染眼睛
        ctx.shadowBlur = 0;
        ctx.fillStyle = colors.text;
        
        const eyeSize = 3;
        const eyeOffset = 6;
        
        if (direction === 'up' || direction === 'down') {
          ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(x + gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
        } else {
          ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(x + eyeOffset, y + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
        }
      } else {
        // 蛇身渐变效果
        const alpha = Math.max(0.3, 1 - (index * 0.1));
        const bodyColor = colors.snake;
        
        ctx.shadowColor = bodyColor;
        ctx.shadowBlur = 8;
        
        ctx.fillStyle = bodyColor;
        ctx.globalAlpha = alpha;
        ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
        ctx.globalAlpha = 1;
      }
    });

    ctx.shadowBlur = 0;
  }, [theme]);

  // 渲染食物
  const renderFood = useCallback((food: Position, animationTime: number) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    const colors = THEME_COLORS[theme];
    const gridSize = GAME_CONFIG.gridSize;
    const x = food.x * gridSize;
    const y = food.y * gridSize;

    // 食物脉动动画
    const pulse = Math.sin(animationTime * 0.01) * 0.2 + 1;
    const size = (gridSize - 4) * pulse;
    const offset = (gridSize - size) / 2;

    // 食物发光效果
    ctx.shadowColor = colors.food;
    ctx.shadowBlur = 20;
    
    ctx.fillStyle = colors.food;
    ctx.fillRect(x + offset, y + offset, size, size);
    
    // 内部高光
    ctx.shadowBlur = 0;
    ctx.fillStyle = colors.foodGlow;
    ctx.fillRect(x + offset + 2, y + offset + 2, size - 4, size - 4);
  }, [theme]);

  // 渲染UI信息
  const renderUI = useCallback((gameState: GameState, gameTime: number) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    const colors = THEME_COLORS[theme];
    
    // 设置字体
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = colors.text;
    ctx.shadowColor = colors.text;
    ctx.shadowBlur = 5;

    // 渲染分数
    ctx.fillText(`分数: ${gameState.score}`, 20, 40);
    
    // 渲染等级
    ctx.fillText(`等级: ${gameState.level}`, 20, 80);
    
    // 渲染时间
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    ctx.fillText(`时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, 20, 120);

    // 渲染游戏状态
    if (gameState.gameStatus === 'paused') {
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.fillText('游戏暂停', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2);
      
      ctx.font = 'bold 24px Arial';
      ctx.fillText('按空格键继续', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 60);
      ctx.textAlign = 'left';
    }

    ctx.shadowBlur = 0;
  }, [theme]);

  // 渲染粒子效果
  const renderParticles = useCallback((deltaTime: number) => {
    const ctx = contextRef.current;
    const particleSystem = particleSystemRef.current;
    if (!ctx || !particleSystem) return;

    particleSystem.update();
    particleSystem.render();
  }, []);

  // 添加粒子效果
  const addParticleEffect = useCallback((type: string, position: Position, options?: any) => {
    const particleSystem = particleSystemRef.current;
    if (!particleSystem) return;

    const x = position.x * GAME_CONFIG.gridSize + GAME_CONFIG.gridSize / 2;
    const y = position.y * GAME_CONFIG.gridSize + GAME_CONFIG.gridSize / 2;

    switch (type) {
      case 'eat':
        particleSystem.createFoodExplosion(x, y, THEME_COLORS[theme].food);
        break;
      case 'gameOver':
        particleSystem.createGameOverExplosion(x, y);
        break;
      case 'levelUp':
        particleSystem.createLevelUpEffect(x, y);
        break;
    }
  }, [theme]);

  // 主渲染函数
  const render = useCallback((gameState: GameState, gameTime: number) => {
    const now = performance.now();
    const deltaTime = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;

    // 清空画布
    clearCanvas();

    // 渲染背景
    renderBackground(deltaTime);

    // 渲染游戏元素
    renderSnake(gameState.snake, gameState.direction);
    renderFood(gameState.food, now);

    // 渲染粒子效果
    renderParticles(deltaTime);

    // 渲染UI
    renderUI(gameState, gameTime);
  }, [clearCanvas, renderBackground, renderSnake, renderFood, renderParticles, renderUI]);

  // 开始渲染循环
  const startRenderLoop = useCallback((gameState: GameState, gameTime: number) => {
    const renderFrame = () => {
      render(gameState, gameTime);
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    renderFrame();
  }, [render]);

  // 停止渲染循环
  const stopRenderLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // 调整Canvas尺寸
  const resizeCanvas = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    // 重新初始化星空
    const ctx = canvas.getContext('2d');
    if (ctx) {
      starsRef.current = particleUtils.createStarField(canvas, ctx, 50);
    }
  }, []);

  // 清理资源
  useEffect(() => {
    return () => {
      stopRenderLoop();
      if (particleSystemRef.current) {
        particleSystemRef.current.clear();
      }
    };
  }, [stopRenderLoop]);

  // 返回渲染引擎接口
  return {
    // Canvas引用
    canvasRef,
    
    // 初始化和控制
    initCanvas,
    render,
    startRenderLoop,
    stopRenderLoop,
    resizeCanvas,
    
    // 渲染函数
    renderBackground,
    renderSnake,
    renderFood,
    renderUI,
    renderParticles,
    
    // 特效
    addParticleEffect,
    
    // 工具函数
    clearCanvas
  };
};