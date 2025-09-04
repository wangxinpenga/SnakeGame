import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Palette, Zap, RotateCcw } from 'lucide-react';
import { GameSettings, Theme, GameSpeed } from '../types/game';
import { DEFAULT_SETTINGS, THEME_COLORS } from '../constants/game';
import { storageUtils } from '../utils/gameUtils';
import { audioManager } from '../utils/audioUtils';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // 加载设置
  useEffect(() => {
    const loadedSettings = storageUtils.loadSettings();
    setSettings(loadedSettings);
  }, []);

  // 保存设置
  const saveSettings = () => {
    storageUtils.saveSettings(settings);
    setHasChanges(false);
    
    // 应用音频设置
    audioManager.setVolume(settings.soundEnabled ? settings.volume : 0);
    
    // 显示保存成功提示
    if (settings.soundEnabled) {
      audioManager.playSound('move');
    }
  };

  // 重置设置
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  // 更新设置
  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // 返回主菜单
  const goBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm('您有未保存的更改，确定要离开吗？');
      if (!confirmed) return;
    }
    navigate('/');
  };

  // 主题选项
  const themeOptions: { value: Theme; label: string; colors: string[] }[] = [
    {
      value: 'neon',
      label: '霓虹风格',
      colors: ['#00ffff', '#ff00ff', '#ffff00']
    },
    {
      value: 'classic',
      label: '经典风格',
      colors: ['#00ff00', '#ff0000', '#ffffff']
    },
    {
      value: 'retro',
      label: '复古风格',
      colors: ['#666666', '#333333', '#999999']
    }
  ];

  // 速度选项
  const speedOptions: { value: GameSpeed; label: string; description: string }[] = [
    { value: 'slow', label: '慢速', description: '适合新手' },
    { value: 'normal', label: '正常', description: '标准速度' },
    { value: 'fast', label: '快速', description: '挑战模式' },
    { value: 'extreme', label: '极速', description: '专家级别' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg"
          >
            <ArrowLeft size={20} />
            返回
          </button>
          
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            游戏设置
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={resetSettings}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
            >
              <RotateCcw size={16} />
              重置
            </button>
            
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className={`px-6 py-2 rounded-lg transition-all duration-200 shadow-lg ${
                hasChanges
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              保存设置
            </button>
          </div>
        </div>

        {/* 设置面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 音效设置 */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-400/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="text-cyan-400" size={24} />
              <h2 className="text-2xl font-bold text-white">音效设置</h2>
            </div>
            
            {/* 音效开关 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-medium">启用音效</label>
                <button
                  onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    settings.soundEnabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <p className="text-gray-400 text-sm">开启或关闭游戏音效和背景音乐</p>
            </div>
            
            {/* 音量控制 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-medium">音量大小</label>
                <span className="text-cyan-400 font-bold">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                disabled={!settings.soundEnabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <p className="text-gray-400 text-sm mt-2">调整游戏音效和背景音乐的音量</p>
            </div>
            
            {/* 背景音乐开关 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-medium">背景音乐</label>
                <button
                  onClick={() => updateSetting('musicEnabled', !settings.musicEnabled)}
                  disabled={!settings.soundEnabled}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    settings.musicEnabled && settings.soundEnabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    settings.musicEnabled && settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <p className="text-gray-400 text-sm">开启或关闭背景音乐</p>
            </div>
          </div>

          {/* 游戏设置 */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold text-white">游戏设置</h2>
            </div>
            
            {/* 游戏速度 */}
            <div className="mb-6">
              <label className="text-white font-medium mb-3 block">游戏速度</label>
              <div className="grid grid-cols-2 gap-2">
                {speedOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('gameSpeed', option.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      settings.gameSpeed === option.value
                        ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 显示网格 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-medium">显示网格</label>
                <button
                  onClick={() => updateSetting('showGrid', !settings.showGrid)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    settings.showGrid ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                    settings.showGrid ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <p className="text-gray-400 text-sm">在游戏区域显示网格线</p>
            </div>
          </div>

          {/* 主题设置 */}
          <div className="lg:col-span-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-400/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="text-green-400" size={24} />
              <h2 className="text-2xl font-bold text-white">主题设置</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themeOptions.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSetting('theme', theme.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    settings.theme === theme.value
                      ? 'border-green-400 bg-green-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-1">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-white font-medium">{theme.label}</span>
                  </div>
                  
                  {/* 主题预览 */}
                  <div className="bg-gray-800 rounded p-2">
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 32 }, (_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-sm"
                          style={{
                            backgroundColor: i < 3 ? theme.colors[0] : 
                                           i === 10 ? theme.colors[1] : 
                                           'rgba(255,255,255,0.1)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        {hasChanges && (
          <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
            <p className="text-yellow-300 text-center">
              ⚠️ 您有未保存的更改，请点击"保存设置"按钮保存您的更改
            </p>
          </div>
        )}
      </div>
      
      {/* 自定义样式 */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        
        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Settings;