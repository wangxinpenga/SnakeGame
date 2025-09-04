import { Position, Direction, GameState, GameSettings, GameStats, GameStatistics, ScoreRecord, SoundType } from '../types/game';
import { GAME_CONFIG, STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_STATISTICS } from '../constants/game';

// 位置相关工具函数
export const positionUtils = {
  // 检查两个位置是否相等
  isEqual: (pos1: Position, pos2: Position): boolean => {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  },

  // 生成随机位置
  generateRandom: (excludePositions: Position[] = []): Position => {
    const maxX = Math.floor(GAME_CONFIG.canvasWidth / GAME_CONFIG.gridSize);
    const maxY = Math.floor(GAME_CONFIG.canvasHeight / GAME_CONFIG.gridSize);
    
    let position: Position;
    do {
      position = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY)
      };
    } while (excludePositions.some(pos => positionUtils.isEqual(pos, position)));
    
    return position;
  },

  // 检查位置是否在边界内
  isInBounds: (position: Position): boolean => {
    const maxX = Math.floor(GAME_CONFIG.canvasWidth / GAME_CONFIG.gridSize);
    const maxY = Math.floor(GAME_CONFIG.canvasHeight / GAME_CONFIG.gridSize);
    
    return position.x >= 0 && position.x < maxX && position.y >= 0 && position.y < maxY;
  },

  // 根据方向移动位置
  moveInDirection: (position: Position, direction: Direction): Position => {
    const newPosition = { ...position };
    
    switch (direction) {
      case 'up':
        newPosition.y -= 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
    }
    
    return newPosition;
  }
};

// 方向相关工具函数
export const directionUtils = {
  // 检查方向是否相反
  isOpposite: (dir1: Direction, dir2: Direction): boolean => {
    const opposites: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };
    return opposites[dir1] === dir2;
  },

  // 从键盘事件获取方向
  fromKeyboard: (key: string): Direction | null => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      KeyW: 'up',
      KeyS: 'down',
      KeyA: 'left',
      KeyD: 'right'
    };
    return keyMap[key] || null;
  }
};

// 游戏逻辑工具函数
export const gameLogicUtils = {
  // 检查蛇是否撞到自己
  checkSelfCollision: (head: Position, snake: Position[]): boolean => {
    return snake.some(segment => positionUtils.isEqual(head, segment));
  },

  // 检查蛇是否撞到边界
  checkWallCollision: (head: Position): boolean => {
    return !positionUtils.isInBounds(head);
  },

  // 检查蛇是否吃到食物
  checkFoodCollision: (head: Position, food: Position): boolean => {
    return positionUtils.isEqual(head, food);
  },

  // 移动蛇
  moveSnake: (snake: Position[], direction: Direction, grow: boolean = false): Position[] => {
    const head = snake[0];
    const newHead = positionUtils.moveInDirection(head, direction);
    const newSnake = [newHead, ...snake];
    
    if (!grow) {
      newSnake.pop();
    }
    
    return newSnake;
  },

  // 计算分数
  calculateScore: (currentScore: number, level: number): number => {
    return currentScore + (10 * level);
  },

  // 计算等级
  calculateLevel: (score: number): number => {
    return Math.floor(score / 100) + 1;
  },

  // 计算游戏速度
  calculateSpeed: (level: number, baseSpeed: number): number => {
    const speedIncrease = Math.floor((level - 1) / 2) * 10;
    return Math.max(baseSpeed - speedIncrease, 30);
  }
};

// 本地存储工具函数
export const storageUtils = {
  // 保存游戏设置
  saveSettings: (settings: GameSettings): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  // 加载游戏设置
  loadSettings: (): GameSettings => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  // 保存游戏统计
  saveStatistics: (stats: GameStatistics): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_STATISTICS, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save statistics:', error);
    }
  },

  // 加载游戏统计
  loadStatistics: (): GameStatistics => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATISTICS);
      return saved ? { ...DEFAULT_STATISTICS, ...JSON.parse(saved) } : DEFAULT_STATISTICS;
    } catch (error) {
      console.error('Failed to load statistics:', error);
      return DEFAULT_STATISTICS;
    }
  },

  // 保存分数记录
  saveScoreRecord: (record: ScoreRecord): void => {
    try {
      const records = storageUtils.loadScoreRecords();
      records.unshift(record);
      const limitedRecords = records.slice(0, GAME_CONFIG.maxRecentScores);
      localStorage.setItem(STORAGE_KEYS.SCORE_RECORDS, JSON.stringify(limitedRecords));
    } catch (error) {
      console.error('Failed to save score record:', error);
    }
  },

  // 加载分数记录
  loadScoreRecords: (): ScoreRecord[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCORE_RECORDS);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load score records:', error);
      return [];
    }
  },

  // 清空分数记录
  clearScoreRecords: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SCORE_RECORDS);
    } catch (error) {
      console.error('Failed to clear score records:', error);
    }
  },

  // 添加分数记录（兼容旧版本）
  addScoreRecord: (score: number, gameMode: string, duration: number, level: number): void => {
    const record: ScoreRecord = {
      id: Date.now().toString(),
      score,
      date: new Date().toISOString(),
      gameMode,
      duration,
      level
    };
    
    storageUtils.saveScoreRecord(record);
    
    // 更新统计数据
    const stats = storageUtils.loadStatistics();
    const updatedStats: GameStatistics = {
      ...stats,
      totalGames: stats.totalGames + 1,
      totalScore: stats.totalScore + score,
      totalPlayTime: stats.totalPlayTime + duration,
      highScore: Math.max(stats.highScore, score),
      highestLevel: Math.max(stats.highestLevel, level),
      averageScore: (stats.totalScore + score) / (stats.totalGames + 1),
      recentScores: [record, ...stats.recentScores.slice(0, GAME_CONFIG.maxRecentScores - 1)]
    };
    
    storageUtils.saveStatistics(updatedStats);
  }
};

// 时间工具函数
export const timeUtils = {
  // 格式化时间（秒转为 mm:ss）
  formatTime: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // 格式化日期
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// 数学工具函数
export const mathUtils = {
  // 限制数值在指定范围内
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },

  // 线性插值
  lerp: (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  },

  // 生成随机数
  random: (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  },

  // 生成随机整数
  randomInt: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

// 动画工具函数
export const animationUtils = {
  // 缓动函数
  easeInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  // 弹性缓动
  easeElastic: (t: number): number => {
    return t === 0 || t === 1 ? t : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  },

  // 反弹缓动
  easeBounce: (t: number): number => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
};