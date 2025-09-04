import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, RotateCcw, Home, Share2, Star, Clock, Target, TrendingUp } from 'lucide-react';
import { ScoreRecord, GameStatistics } from '../types/game';
import { storageUtils } from '../utils/gameUtils';
import { AudioManager } from '../utils/audioUtils';

interface GameOverState {
  score: number;
  level: number;
  duration: number;
  gameMode: string;
  isNewRecord?: boolean;
}

const GameOver: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameData, setGameData] = useState<GameOverState | null>(null);
  const [statistics, setStatistics] = useState<GameStatistics | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [audioManager] = useState(() => new AudioManager());

  useEffect(() => {
    // 获取游戏数据
    const state = location.state as GameOverState;
    if (state) {
      setGameData(state);
      
      // 保存分数记录
      const scoreRecord: ScoreRecord = {
        id: Date.now().toString(),
        score: state.score,
        level: state.level,
        duration: state.duration,
        date: new Date().toISOString(),
        gameMode: state.gameMode || 'classic'
      };
      
      // 检查是否是新记录
      const currentRecords = storageUtils.loadScoreRecords();
      const highestScore = Math.max(0, ...currentRecords.map(r => r.score));
      const isRecord = state.score > highestScore;
      setIsNewRecord(isRecord);
      
      if (isRecord) {
        setShowCelebration(true);
        audioManager.playSound('levelUp');
        setTimeout(() => setShowCelebration(false), 3000);
      }
      
      // 保存记录
      storageUtils.saveScoreRecord(scoreRecord);
      
      // 更新统计数据
      const currentStats = storageUtils.loadStatistics();
      const updatedStats: GameStatistics = {
        ...currentStats,
        totalGames: currentStats.totalGames + 1,
        totalScore: currentStats.totalScore + state.score,
        totalPlayTime: currentStats.totalPlayTime + state.duration,
        highScore: Math.max(currentStats.highScore, state.score),
        highestLevel: Math.max(currentStats.highestLevel, state.level),
        averageScore: (currentStats.totalScore + state.score) / (currentStats.totalGames + 1),
        recentScores: [{
          id: Date.now().toString(),
          score: state.score,
          date: new Date().toISOString(),
          gameMode: 'classic',
          duration: state.duration,
          level: state.level
        }, ...currentStats.recentScores.slice(0, 9)]
      };
      
      storageUtils.saveStatistics(updatedStats);
      setStatistics(updatedStats);
    } else {
      // 如果没有游戏数据，返回主菜单
      navigate('/');
    }

    return () => {
      audioManager.destroy();
    };
  }, [location.state, navigate, audioManager]);

  // 重新开始游戏
  const restartGame = () => {
    audioManager.playSound('move');
    navigate('/game');
  };

  // 返回主菜单
  const goHome = () => {
    audioManager.playSound('move');
    navigate('/');
  };

  // 查看分数排行
  const viewScores = () => {
    audioManager.playSound('move');
    navigate('/scores');
  };

  // 分享分数
  const shareScore = () => {
    if (gameData) {
      const text = `我在华丽贪吃蛇游戏中获得了 ${gameData.score} 分！等级 ${gameData.level}，用时 ${formatTime(gameData.duration)}。快来挑战吧！`;
      
      if (navigator.share) {
        navigator.share({
          title: '华丽贪吃蛇 - 分数分享',
          text: text,
          url: window.location.origin
        });
      } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(text).then(() => {
          alert('分数已复制到剪贴板！');
        });
      }
    }
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 获取等级评价
  const getLevelRating = (level: number): { text: string; color: string } => {
    if (level >= 20) return { text: '传奇大师', color: 'text-yellow-400' };
    if (level >= 15) return { text: '超级高手', color: 'text-purple-400' };
    if (level >= 10) return { text: '资深玩家', color: 'text-blue-400' };
    if (level >= 5) return { text: '熟练玩家', color: 'text-green-400' };
    return { text: '新手玩家', color: 'text-gray-400' };
  };

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const levelRating = getLevelRating(gameData.level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 庆祝动画 */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl font-bold text-yellow-400 animate-bounce">
              🎉 新记录！ 🎉
            </div>
          </div>
          {/* 粒子效果 */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl w-full">
        {/* 游戏结束标题 */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-4">
            游戏结束
          </h1>
          {isNewRecord && (
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-xl font-semibold">
              <Trophy size={24} />
              <span>恭喜！新的最高记录！</span>
              <Trophy size={24} />
            </div>
          )}
        </div>

        {/* 游戏结果卡片 */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8 shadow-2xl">
          {/* 主要分数 */}
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
              {gameData.score.toLocaleString()}
            </div>
            <div className="text-gray-400 text-lg">最终分数</div>
          </div>

          {/* 详细统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
              <Target className="text-purple-400 mx-auto mb-2" size={32} />
              <div className="text-2xl font-bold text-white mb-1">{gameData.level}</div>
              <div className="text-purple-400 text-sm">达到等级</div>
              <div className={`text-xs mt-1 ${levelRating.color}`}>{levelRating.text}</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
              <Clock className="text-green-400 mx-auto mb-2" size={32} />
              <div className="text-2xl font-bold text-white mb-1">{formatTime(gameData.duration)}</div>
              <div className="text-green-400 text-sm">游戏时长</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
              <TrendingUp className="text-cyan-400 mx-auto mb-2" size={32} />
              <div className="text-2xl font-bold text-white mb-1">
                {gameData.duration > 0 ? Math.round(gameData.score / gameData.duration * 60) : 0}
              </div>
              <div className="text-cyan-400 text-sm">每分钟得分</div>
            </div>
          </div>

          {/* 统计对比 */}
          {statistics && (
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">个人统计</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-yellow-400 font-bold text-lg">{statistics.highScore}</div>
                  <div className="text-gray-400 text-sm">历史最高</div>
                </div>
                <div>
                  <div className="text-purple-400 font-bold text-lg">{statistics.totalGames}</div>
                  <div className="text-gray-400 text-sm">总游戏数</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold text-lg">{Math.round(statistics.averageScore)}</div>
                  <div className="text-gray-400 text-sm">平均分数</div>
                </div>
                <div>
                  <div className="text-cyan-400 font-bold text-lg">{statistics.highestLevel}</div>
                  <div className="text-gray-400 text-sm">最高等级</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={restartGame}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RotateCcw size={20} />
            <span className="hidden sm:inline">再来一局</span>
          </button>
          
          <button
            onClick={goHome}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Home size={20} />
            <span className="hidden sm:inline">主菜单</span>
          </button>
          
          <button
            onClick={viewScores}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Star size={20} />
            <span className="hidden sm:inline">排行榜</span>
          </button>
          
          <button
            onClick={shareScore}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Share2 size={20} />
            <span className="hidden sm:inline">分享</span>
          </button>
        </div>

        {/* 鼓励文字 */}
        <div className="text-center mt-8">
          <p className="text-gray-400">
            {gameData.score > (statistics?.averageScore || 0) 
              ? "表现出色！继续保持！" 
              : "不要气馁，再试一次！"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameOver;