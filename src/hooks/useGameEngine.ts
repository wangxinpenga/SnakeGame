import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Direction, Position, GameEvent, GameSettings } from '../types/game';
import { 
  INITIAL_GAME_STATE, 
  GAME_CONFIG, 
  DIFFICULTY_CONFIG,
  DEFAULT_SETTINGS 
} from '../constants/game';
import { 
  gameLogicUtils, 
  positionUtils, 
  directionUtils, 
  storageUtils 
} from '../utils/gameUtils';
import { audioManager } from '../utils/audioUtils';

// 游戏引擎Hook
export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [gameTime, setGameTime] = useState<number>(0);

  // 初始化游戏
  const initGame = useCallback(() => {
    const loadedSettings = storageUtils.loadSettings();
    setSettings(loadedSettings);
    
    const initialState: GameState = {
      ...INITIAL_GAME_STATE,
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ],
      food: positionUtils.generateRandom([
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ]),
      speed: GAME_CONFIG.speedSettings[loadedSettings.gameSpeed]
    };
    
    setGameState(initialState);
    setGameTime(0);
    startTimeRef.current = Date.now();
  }, []);

  // 生成新食物
  const generateFood = useCallback((snake: Position[]): Position => {
    return positionUtils.generateRandom(snake);
  }, []);

  // 处理游戏事件
  const handleGameEvent = useCallback((event: GameEvent) => {
    setGameState(prevState => {
      switch (event.type) {
        case 'MOVE':
          if (prevState.gameStatus !== 'playing') return prevState;
          
          // 检查方向是否有效（不能反向移动）
          if (directionUtils.isOpposite(event.direction, prevState.direction)) {
            return prevState;
          }
          
          return {
            ...prevState,
            nextDirection: event.direction
          };

        case 'PAUSE':
          if (prevState.gameStatus === 'playing') {
            audioManager.playSound('pause');
            return {
              ...prevState,
              gameStatus: 'paused'
            };
          }
          return prevState;

        case 'RESUME':
          if (prevState.gameStatus === 'paused') {
            audioManager.playSound('pause');
            return {
              ...prevState,
              gameStatus: 'playing'
            };
          }
          return prevState;

        case 'RESTART':
          audioManager.playSound('move');
          const newState: GameState = {
            ...INITIAL_GAME_STATE,
            snake: [
              { x: 10, y: 10 },
              { x: 9, y: 10 },
              { x: 8, y: 10 }
            ],
            food: positionUtils.generateRandom([
              { x: 10, y: 10 },
              { x: 9, y: 10 },
              { x: 8, y: 10 }
            ]),
            speed: GAME_CONFIG.speedSettings[settings.gameSpeed]
          };
          setGameTime(0);
          startTimeRef.current = Date.now();
          return newState;

        case 'GAME_OVER':
          audioManager.playSound('gameOver');
          
          // 保存分数记录
          const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
          storageUtils.addScoreRecord(
            prevState.score,
            'classic',
            duration,
            prevState.level
          );
          
          return {
            ...prevState,
            gameStatus: 'gameOver'
          };

        case 'EAT_FOOD':
          audioManager.playSound('eat');
          
          const newScore = gameLogicUtils.calculateScore(prevState.score, prevState.level);
          const newLevel = gameLogicUtils.calculateLevel(newScore);
          const levelUp = newLevel > prevState.level;
          
          if (levelUp) {
            audioManager.playSound('levelUp');
          }
          
          return {
            ...prevState,
            score: newScore,
            level: newLevel,
            speed: gameLogicUtils.calculateSpeed(newLevel, GAME_CONFIG.speedSettings[settings.gameSpeed]),
            food: generateFood(prevState.snake)
          };

        case 'LEVEL_UP':
          audioManager.playSound('levelUp');
          return prevState;

        default:
          return prevState;
      }
    });
  }, [generateFood, settings.gameSpeed]);

  // 游戏主循环
  const gameLoop = useCallback(() => {
    const now = Date.now();
    
    setGameState(prevState => {
      if (prevState.gameStatus !== 'playing') {
        return prevState;
      }

      // 检查是否到了更新时间
      if (now - lastUpdateRef.current < prevState.speed) {
        return prevState;
      }

      lastUpdateRef.current = now;

      // 更新游戏时间
      setGameTime(Math.floor((now - startTimeRef.current) / 1000));

      // 更新方向
      const currentDirection = prevState.nextDirection;
      
      // 移动蛇
      const newHead = positionUtils.moveInDirection(prevState.snake[0], currentDirection);
      
      // 检查墙壁碰撞
      if (gameLogicUtils.checkWallCollision(newHead)) {
        handleGameEvent({ type: 'GAME_OVER' });
        return {
          ...prevState,
          gameStatus: 'gameOver'
        };
      }
      
      // 检查自身碰撞（检查新头部是否与当前蛇身碰撞）
      if (gameLogicUtils.checkSelfCollision(newHead, prevState.snake)) {
        handleGameEvent({ type: 'GAME_OVER' });
        return {
          ...prevState,
          gameStatus: 'gameOver'
        };
      }
      
      // 检查食物碰撞
      const ateFood = gameLogicUtils.checkFoodCollision(newHead, prevState.food);
      
      // 移动蛇身
      const newSnake = gameLogicUtils.moveSnake(prevState.snake, currentDirection, ateFood);
      
      let newState = {
        ...prevState,
        snake: newSnake,
        direction: currentDirection
      };
      
      // 如果吃到食物
      if (ateFood) {
        const newScore = gameLogicUtils.calculateScore(prevState.score, prevState.level);
        const newLevel = gameLogicUtils.calculateLevel(newScore);
        const levelUp = newLevel > prevState.level;
        
        newState = {
          ...newState,
          score: newScore,
          level: newLevel,
          speed: gameLogicUtils.calculateSpeed(newLevel, GAME_CONFIG.speedSettings[settings.gameSpeed]),
          food: generateFood(newSnake)
        };
        
        // 播放音效
        audioManager.playSound('eat');
        
        if (levelUp) {
          audioManager.playSound('levelUp');
        }
      }
      
      return newState;
    });
  }, [handleGameEvent, generateFood, settings.gameSpeed]);

  // 开始游戏
  const startGame = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      gameStatus: 'playing'
    }));
    
    startTimeRef.current = Date.now();
    lastUpdateRef.current = Date.now();
    
    // 启动游戏循环
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = setInterval(gameLoop, 16); // ~60 FPS
  }, [gameLoop]);

  // 停止游戏
  const stopGame = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  // 暂停/恢复游戏
  const togglePause = useCallback(() => {
    if (gameState.gameStatus === 'playing') {
      handleGameEvent({ type: 'PAUSE' });
      stopGame();
    } else if (gameState.gameStatus === 'paused') {
      handleGameEvent({ type: 'RESUME' });
      startGame();
    }
  }, [gameState.gameStatus, handleGameEvent, startGame, stopGame]);

  // 重新开始游戏
  const restartGame = useCallback(() => {
    stopGame();
    handleGameEvent({ type: 'RESTART' });
    setTimeout(() => {
      startGame();
    }, 100);
  }, [handleGameEvent, startGame, stopGame]);

  // 更新设置
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    storageUtils.saveSettings(updatedSettings);
    
    // 如果更新了游戏速度，立即应用
    if (newSettings.gameSpeed) {
      setGameState(prevState => ({
        ...prevState,
        speed: GAME_CONFIG.speedSettings[newSettings.gameSpeed!]
      }));
    }
  }, [settings]);

  // 处理键盘输入
  const handleKeyPress = useCallback((key: string) => {
    const direction = directionUtils.fromKeyboard(key);
    if (direction) {
      handleGameEvent({ type: 'MOVE', direction });
    } else if (key === 'Space' || key === ' ') {
      togglePause();
    } else if (key === 'KeyR') {
      restartGame();
    }
  }, [handleGameEvent, togglePause, restartGame]);

  // 清理资源
  useEffect(() => {
    return () => {
      stopGame();
    };
  }, [stopGame]);

  // 返回游戏引擎接口
  return {
    // 游戏状态
    gameState,
    settings,
    gameTime,
    
    // 游戏控制
    initGame,
    startGame,
    stopGame,
    togglePause,
    restartGame,
    
    // 事件处理
    handleGameEvent,
    handleKeyPress,
    
    // 设置管理
    updateSettings,
    
    // 工具函数
    generateFood
  };
};