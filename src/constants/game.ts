import { GameConfig, GameSettings, GameStats, GameState, GameSpeed, GameStatistics } from '../types/game';

// 游戏配置常量
export const GAME_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  gridSize: 20,
  initialSnakeLength: 3,
  speedSettings: {
    slow: 150,
    medium: 100,
    fast: 60,
    normal: 100,
    extreme: 40
  },
  maxRecentScores: 10,
  particleCount: 50
};

// 本地存储键名
export const STORAGE_KEYS = {
  GAME_SETTINGS: 'snake_game_settings',
  GAME_STATISTICS: 'snake_game_statistics',
  SCORE_RECORDS: 'snake_game_score_records',
  HIGH_SCORES: 'snake_game_high_scores'
} as const;

// 默认游戏设置
export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  gameSpeed: 'medium',
  theme: 'neon',
  volume: 0.7,
  showGrid: false,
  controls: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    pause: 'Space'
  }
};

// 默认统计数据
export const DEFAULT_STATISTICS: GameStatistics = {
  highScore: 0,
  totalGames: 0,
  totalScore: 0,
  averageScore: 0,
  totalPlayTime: 0,
  recentScores: [],
  highestLevel: 1
};

// 初始游戏状态
export const INITIAL_GAME_STATE: GameState = {
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ],
  food: { x: 15, y: 15 },
  direction: 'right',
  nextDirection: 'right',
  score: 0,
  gameStatus: 'ready',
  speed: GAME_CONFIG.speedSettings.medium,
  level: 1
};

// 颜色主题配置
export const THEME_COLORS = {
  neon: {
    background: '#1a1a2e',
    snake: '#00ff88',
    snakeGlow: '#00ff88',
    food: '#ffd700',
    foodGlow: '#ffd700',
    grid: '#2a2a4e',
    text: '#ffffff',
    accent: '#8a2be2',
    button: 'linear-gradient(135deg, #00ff88, #00cc66)',
    buttonHover: 'linear-gradient(135deg, #00cc66, #00aa55)'
  },
  classic: {
    background: '#2d5016',
    snake: '#90ee90',
    snakeGlow: '#90ee90',
    food: '#ff4444',
    foodGlow: '#ff4444',
    grid: '#3d6026',
    text: '#ffffff',
    accent: '#ffff00',
    button: 'linear-gradient(135deg, #90ee90, #7dd87d)',
    buttonHover: 'linear-gradient(135deg, #7dd87d, #6bc26b)'
  },
  retro: {
    background: '#000000',
    snake: '#00ff00',
    snakeGlow: '#00ff00',
    food: '#ff0000',
    foodGlow: '#ff0000',
    grid: '#333333',
    text: '#00ff00',
    accent: '#ffff00',
    button: 'linear-gradient(135deg, #00ff00, #00cc00)',
    buttonHover: 'linear-gradient(135deg, #00cc00, #009900)'
  }
} as const;

// 音效文件路径（占位符，实际使用Web Audio API生成）
export const SOUND_EFFECTS = {
  eat: 'eat.wav',
  gameOver: 'gameOver.wav',
  move: 'move.wav',
  pause: 'pause.wav',
  levelUp: 'levelUp.wav',
  backgroundMusic: 'background.mp3'
} as const;

// 游戏难度配置
export const DIFFICULTY_CONFIG = {
  scorePerFood: 10,
  levelUpScore: 100,
  speedIncreasePerLevel: 5,
  maxLevel: 20
} as const;

// 粒子效果配置
export const PARTICLE_CONFIG = {
  maxParticles: 100,
  particleLife: 60,
  particleSpeed: 2,
  particleSize: 3,
  spawnRate: 0.3
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
  fadeInDuration: 300,
  fadeOutDuration: 200,
  scaleAnimationDuration: 150,
  glowPulseDuration: 1000,
  particleAnimationDuration: 2000
} as const;
