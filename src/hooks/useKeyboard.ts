import { useEffect, useCallback, useRef } from 'react';
import { Direction } from '../types/game';
import { directionUtils } from '../utils/gameUtils';

// 键盘控制Hook
export const useKeyboard = (onKeyPress?: (key: string, direction?: Direction) => void) => {
  const keysRef = useRef<Set<string>>(new Set());
  const lastKeyTimeRef = useRef<number>(0);
  const keyRepeatDelayRef = useRef<number>(150); // 按键重复延迟（毫秒）

  // 处理按键按下
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.code || event.key;
    const now = Date.now();
    
    // 防止按键重复触发
    if (keysRef.current.has(key) && now - lastKeyTimeRef.current < keyRepeatDelayRef.current) {
      return;
    }
    
    keysRef.current.add(key);
    lastKeyTimeRef.current = now;
    
    // 阻止默认行为（如箭头键滚动页面）
    const preventDefaultKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'Space'
    ];
    
    if (preventDefaultKeys.includes(key)) {
      event.preventDefault();
    }
    
    // 获取方向
    const direction = directionUtils.fromKeyboard(key);
    
    // 调用回调函数
    if (onKeyPress) {
      onKeyPress(key, direction);
    }
  }, [onKeyPress]);

  // 处理按键释放
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.code || event.key;
    keysRef.current.delete(key);
  }, []);

  // 检查按键是否被按下
  const isKeyPressed = useCallback((key: string): boolean => {
    return keysRef.current.has(key);
  }, []);

  // 检查方向键是否被按下
  const isDirectionPressed = useCallback((direction: Direction): boolean => {
    const keys = getDirectionKeys(direction);
    return keys.some(key => keysRef.current.has(key));
  }, []);

  // 获取当前按下的方向
  const getCurrentDirection = useCallback((): Direction | null => {
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    
    for (const direction of directions) {
      if (isDirectionPressed(direction)) {
        return direction;
      }
    }
    
    return null;
  }, [isDirectionPressed]);

  // 清空所有按键状态
  const clearKeys = useCallback(() => {
    keysRef.current.clear();
  }, []);

  // 设置按键重复延迟
  const setKeyRepeatDelay = useCallback((delay: number) => {
    keyRepeatDelayRef.current = delay;
  }, []);

  // 获取方向对应的按键
  const getDirectionKeys = (direction: Direction): string[] => {
    switch (direction) {
      case 'up':
        return ['ArrowUp', 'KeyW'];
      case 'down':
        return ['ArrowDown', 'KeyS'];
      case 'left':
        return ['ArrowLeft', 'KeyA'];
      case 'right':
        return ['ArrowRight', 'KeyD'];
      default:
        return [];
    }
  };

  // 绑定和解绑事件监听器
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // 页面失去焦点时清空按键状态
    const handleBlur = () => {
      clearKeys();
    };
    
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, clearKeys]);

  // 返回键盘控制接口
  return {
    // 状态检查
    isKeyPressed,
    isDirectionPressed,
    getCurrentDirection,
    
    // 控制函数
    clearKeys,
    setKeyRepeatDelay,
    
    // 工具函数
    getDirectionKeys
  };
};

// 游戏专用键盘控制Hook
export const useGameKeyboard = (onMove: (direction: Direction) => void, onPause: () => void, onRestart: () => void) => {
  const handleKeyPress = useCallback((key: string, direction?: Direction) => {
    if (direction) {
      onMove(direction);
    } else if (key === 'Space' || key === ' ') {
      onPause();
    } else if (key === 'KeyR') {
      onRestart();
    }
  }, [onMove, onPause, onRestart]);

  const keyboard = useKeyboard(handleKeyPress);

  return keyboard;
};

// 触摸控制Hook（移动端支持）
export const useTouchControl = (onMove: (direction: Direction) => void) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 30; // 最小滑动距离

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    if (touch) {
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY
      };
    }
  }, []);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    const touch = event.changedTouches[0];
    const startPos = touchStartRef.current;
    
    if (!touch || !startPos) return;

    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 检查是否达到最小滑动距离
    if (distance < minSwipeDistance) return;

    // 确定滑动方向
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      // 水平滑动
      onMove(deltaX > 0 ? 'right' : 'left');
    } else {
      // 垂直滑动
      onMove(deltaY > 0 ? 'down' : 'up');
    }

    touchStartRef.current = null;
  }, [onMove]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    // 阻止页面滚动
    event.preventDefault();
  }, []);

  // 绑定触摸事件
  useEffect(() => {
    const options = { passive: false };
    
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchend', handleTouchEnd, options);
    document.addEventListener('touchmove', handleTouchMove, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleTouchStart, handleTouchEnd, handleTouchMove]);

  return {
    // 触摸控制已自动处理，无需额外接口
  };
}