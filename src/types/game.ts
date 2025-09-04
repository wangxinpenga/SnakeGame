// 游戏核心类型定义

// 位置坐标
export interface Position {
  x: number;
  y: number;
}

// 方向类型
export type Direction = 'up' | 'down' | 'left' | 'right';

// 游戏状态
export type GameStatus = 'playing' | 'paused' | 'gameOver' | 'ready';

// 游戏速度
export type GameSpeed = 'slow' | 'medium' | 'fast' | 'normal' | 'extreme';

// 游戏主题
export type GameTheme = 'classic' | 'neon' | 'retro';

// 主题类型别名（向后兼容）
export type Theme = GameTheme;

// 游戏状态接口
export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  gameStatus: GameStatus;
  speed: number;
  level: number;
}

// 游戏设置接口
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  gameSpeed: GameSpeed;
  theme: GameTheme;
  volume: number;
  showGrid: boolean;
  controls: {
    up: string;
    down: string;
    left: string;
    right: string;
    pause: string;
  };
}

// 分数记录接口
export interface ScoreRecord {
  id: string;
  score: number;
  date: string;
  gameMode: string;
  duration: number;
  level: number;
}

// 游戏统计接口
export interface GameStats {
  highScore: number;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  totalPlayTime: number;
  recentScores: ScoreRecord[];
  highestLevel: number;
}

// 游戏统计类型别名（向后兼容）
export type GameStatistics = GameStats;

// 音效类型
export type SoundType = 'eat' | 'gameOver' | 'move' | 'pause' | 'levelUp';

// 粒子效果接口
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// 游戏配置接口
export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  initialSnakeLength: number;
  speedSettings: Record<GameSpeed, number>;
  maxRecentScores: number;
  particleCount: number;
}

// 渲染上下文接口
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  theme: GameTheme;
  particles: Particle[];
}

// 游戏事件类型
export type GameEvent = 
  | { type: 'MOVE'; direction: Direction }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'GAME_OVER' }
  | { type: 'EAT_FOOD' }
  | { type: 'LEVEL_UP' };

// 页面路由类型
export type PageRoute = '/' | '/game' | '/settings' | '/game-over' | '/scores' | '/instructions';