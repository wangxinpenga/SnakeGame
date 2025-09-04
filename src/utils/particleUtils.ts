import { Particle } from '../types/game';
import { PARTICLE_CONFIG } from '../constants/game';
import { mathUtils } from './gameUtils';

// 粒子系统类
export class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  // 创建粒子爆炸效果（吃食物时）
  public createFoodExplosion(x: number, y: number, color: string = '#ffd700'): void {
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = mathUtils.random(2, 6);
      
      const particle: Particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: PARTICLE_CONFIG.particleLife,
        maxLife: PARTICLE_CONFIG.particleLife,
        color: color,
        size: mathUtils.random(2, 5)
      };
      
      this.particles.push(particle);
    }
  }

  // 创建游戏结束粒子效果
  public createGameOverExplosion(centerX: number, centerY: number): void {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = mathUtils.random(3, 10);
      const distance = mathUtils.random(0, 100);
      
      const particle: Particle = {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: PARTICLE_CONFIG.particleLife * 2,
        maxLife: PARTICLE_CONFIG.particleLife * 2,
        color: this.getRandomColor(),
        size: mathUtils.random(3, 8)
      };
      
      this.particles.push(particle);
    }
  }

  // 创建升级粒子效果
  public createLevelUpEffect(centerX: number, centerY: number): void {
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = mathUtils.random(1, 4);
      
      const particle: Particle = {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // 向上飘散
        life: PARTICLE_CONFIG.particleLife * 1.5,
        maxLife: PARTICLE_CONFIG.particleLife * 1.5,
        color: '#00ff88',
        size: mathUtils.random(2, 4)
      };
      
      this.particles.push(particle);
    }
  }

  // 创建蛇移动轨迹粒子
  public createTrailParticles(x: number, y: number, color: string = '#00ff88'): void {
    if (Math.random() < PARTICLE_CONFIG.spawnRate) {
      const particle: Particle = {
        x: x + mathUtils.random(-5, 5),
        y: y + mathUtils.random(-5, 5),
        vx: mathUtils.random(-1, 1),
        vy: mathUtils.random(-1, 1),
        life: PARTICLE_CONFIG.particleLife * 0.5,
        maxLife: PARTICLE_CONFIG.particleLife * 0.5,
        color: color,
        size: mathUtils.random(1, 3)
      };
      
      this.particles.push(particle);
    }
  }

  // 创建背景环境粒子
  public createAmbientParticles(): void {
    if (this.particles.length < 20 && Math.random() < 0.1) {
      const particle: Particle = {
        x: Math.random() * this.canvas.width,
        y: this.canvas.height + 10,
        vx: mathUtils.random(-0.5, 0.5),
        vy: mathUtils.random(-2, -0.5),
        life: PARTICLE_CONFIG.particleLife * 3,
        maxLife: PARTICLE_CONFIG.particleLife * 3,
        color: this.getRandomAmbientColor(),
        size: mathUtils.random(1, 2)
      };
      
      this.particles.push(particle);
    }
  }

  // 更新所有粒子
  public update(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // 应用重力和阻力
      particle.vy += 0.1; // 重力
      particle.vx *= 0.98; // 阻力
      particle.vy *= 0.98;
      
      // 减少生命值
      particle.life--;
      
      // 移除死亡的粒子
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    // 限制粒子数量
    if (this.particles.length > PARTICLE_CONFIG.maxParticles) {
      this.particles.splice(0, this.particles.length - PARTICLE_CONFIG.maxParticles);
    }
  }

  // 渲染所有粒子
  public render(): void {
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * alpha;
      
      this.ctx.save();
      
      // 设置透明度
      this.ctx.globalAlpha = alpha;
      
      // 创建发光效果
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = size * 2;
      
      // 绘制粒子
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  // 获取随机颜色
  private getRandomColor(): string {
    const colors = [
      '#ff0080', '#00ff80', '#8000ff', '#ff8000',
      '#0080ff', '#ff0040', '#40ff00', '#ff4000'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 获取随机环境颜色
  private getRandomAmbientColor(): string {
    const colors = [
      '#00ff8840', '#8000ff40', '#ff008040', '#0080ff40'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 清除所有粒子
  public clear(): void {
    this.particles = [];
  }

  // 获取粒子数量
  public getParticleCount(): number {
    return this.particles.length;
  }
}

// 粒子效果工具函数
export const particleUtils = {
  // 创建星空背景粒子
  createStarField: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, count: number = 100): Particle[] => {
    const stars: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const star: Particle = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: mathUtils.random(0.1, 0.5),
        life: Infinity,
        maxLife: Infinity,
        color: `rgba(255, 255, 255, ${mathUtils.random(0.3, 1)})`,
        size: mathUtils.random(0.5, 2)
      };
      
      stars.push(star);
    }
    
    return stars;
  },

  // 更新星空
  updateStarField: (stars: Particle[], canvas: HTMLCanvasElement): void => {
    stars.forEach(star => {
      star.y += star.vy;
      
      // 重置超出边界的星星
      if (star.y > canvas.height) {
        star.y = -5;
        star.x = Math.random() * canvas.width;
      }
    });
  },

  // 渲染星空
  renderStarField: (stars: Particle[], ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    
    stars.forEach(star => {
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  },

  // 创建网格背景效果
  renderGrid: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gridSize: number, color: string = 'rgba(255, 255, 255, 0.1)'): void => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  },

  // 创建发光效果
  createGlowEffect: (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, intensity: number = 1): void => {
    ctx.save();
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `${color}${Math.floor(255 * intensity).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(0.5, `${color}${Math.floor(128 * intensity).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
};