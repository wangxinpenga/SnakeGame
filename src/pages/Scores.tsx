import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock, Target, TrendingUp, Trash2, Medal } from 'lucide-react';
import { ScoreRecord, GameStatistics } from '../types/game';
import { storageUtils } from '../utils/gameUtils';

const Scores: React.FC = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [statistics, setStatistics] = useState<GameStatistics | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'time'>('score');
  const [filterMode, setFilterMode] = useState<string>('all');

  // 加载分数和统计数据
  useEffect(() => {
    const loadedScores = storageUtils.loadScoreRecords();
    const loadedStats = storageUtils.loadStatistics();
    
    setScores(loadedScores);
    setStatistics(loadedStats);
  }, []);

  // 排序分数
  const sortedScores = [...scores]
    .filter(score => filterMode === 'all' || score.gameMode === filterMode)
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'time':
          return b.duration - a.duration;
        default:
          return 0;
      }
    });

  // 清空分数记录
  const clearScores = () => {
    const confirmed = window.confirm('确定要清空所有分数记录吗？此操作无法撤销。');
    if (confirmed) {
      storageUtils.clearScoreRecords();
      setScores([]);
      
      // 重置统计数据
      const resetStats: GameStatistics = {
        totalGames: 0,
        totalScore: 0,
        totalPlayTime: 0,
        highScore: 0,
        highestLevel: 1,
        averageScore: 0,
        recentScores: []
      };
      
      storageUtils.saveStatistics(resetStats);
      setStatistics(resetStats);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取排名图标
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="text-yellow-400" size={20} />;
      case 1:
        return <Medal className="text-gray-300" size={20} />;
      case 2:
        return <Medal className="text-amber-600" size={20} />;
      default:
        return <span className="text-gray-400 font-bold">{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg"
          >
            <ArrowLeft size={20} />
            返回
          </button>
          
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            分数排行
          </h1>
          
          <button
            onClick={clearScores}
            disabled={scores.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg ${
              scores.length > 0
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Trash2 size={16} />
            清空记录
          </button>
        </div>

        {/* 统计信息 */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 text-center">
              <Trophy className="text-cyan-400 mx-auto mb-2" size={24} />
              <h3 className="text-cyan-400 font-semibold mb-1">最高分数</h3>
              <p className="text-2xl font-bold text-white">{statistics.highScore}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4 text-center">
              <Target className="text-purple-400 mx-auto mb-2" size={24} />
              <h3 className="text-purple-400 font-semibold mb-1">最高等级</h3>
              <p className="text-2xl font-bold text-white">{statistics.highestLevel}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4 text-center">
              <TrendingUp className="text-green-400 mx-auto mb-2" size={24} />
              <h3 className="text-green-400 font-semibold mb-1">游戏次数</h3>
              <p className="text-2xl font-bold text-white">{statistics.totalGames}</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 rounded-lg p-4 text-center">
              <Clock className="text-orange-400 mx-auto mb-2" size={24} />
              <h3 className="text-orange-400 font-semibold mb-1">平均分数</h3>
              <p className="text-2xl font-bold text-white">{Math.round(statistics.averageScore)}</p>
            </div>
          </div>
        )}

        {/* 筛选和排序控件 */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* 排序选项 */}
          <div className="flex items-center gap-2">
            <label className="text-white font-medium">排序：</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'time')}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
            >
              <option value="score">按分数</option>
              <option value="date">按日期</option>
              <option value="time">按时长</option>
            </select>
          </div>
          
          {/* 模式筛选 */}
          <div className="flex items-center gap-2">
            <label className="text-white font-medium">模式：</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">全部</option>
              <option value="classic">经典模式</option>
              <option value="speed">速度模式</option>
              <option value="survival">生存模式</option>
            </select>
          </div>
        </div>

        {/* 分数列表 */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          {sortedScores.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="text-gray-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">暂无分数记录</h3>
              <p className="text-gray-500">开始游戏来创建您的第一个分数记录吧！</p>
            </div>
          ) : (
            <>
              {/* 表头 */}
              <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 p-4 border-b border-gray-700">
                <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-gray-300">
                  <div>排名</div>
                  <div>分数</div>
                  <div>等级</div>
                  <div>时长</div>
                  <div>模式</div>
                  <div>日期</div>
                </div>
              </div>
              
              {/* 分数记录 */}
              <div className="max-h-96 overflow-y-auto">
                {sortedScores.map((score, index) => (
                  <div
                    key={score.id}
                    className={`p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200 ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''
                    }`}
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* 排名 */}
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                      </div>
                      
                      {/* 分数 */}
                      <div className="text-white font-bold text-lg">
                        {score.score.toLocaleString()}
                      </div>
                      
                      {/* 等级 */}
                      <div className="text-purple-400 font-semibold">
                        {score.level}
                      </div>
                      
                      {/* 时长 */}
                      <div className="text-green-400">
                        {formatTime(score.duration)}
                      </div>
                      
                      {/* 模式 */}
                      <div className="text-cyan-400 capitalize">
                        {score.gameMode === 'classic' ? '经典' : 
                         score.gameMode === 'speed' ? '速度' : 
                         score.gameMode === 'survival' ? '生存' : score.gameMode}
                      </div>
                      
                      {/* 日期 */}
                      <div className="text-gray-400 text-sm">
                        {formatDate(score.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center text-gray-400">
          <p>继续游戏来提升您的分数和排名！</p>
        </div>
      </div>
    </div>
  );
};

export default Scores;