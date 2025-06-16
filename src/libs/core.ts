import type { StyleValue } from "vue";

export interface HTMLElementRect {
  width: number;
  height: number;
  top: number;
  left: number;
}

export interface IFrameCreateOptions extends HTMLElementRect {
  uid: string;
  src: string;
  attrs: Record<string, string | number | boolean>;
  onLoaded?: (e: Event) => void;
  onError?: (e: Event | string) => void;
  keepAlive?: boolean;
  container?: HTMLElement;
  parentContainer?: HTMLElement; // 父容器，用于监听滚动事件
}

// 内部使用的接口，继承自 IFrameCreateOptions
interface IFrameOptions extends IFrameCreateOptions {}

// 对外暴露的实例接口
export interface IFrameInstance {
  getEl(): HTMLIFrameElement | null;
  update(src: string): void;
  show(): void;
  hide(): void;
  resize(rect: HTMLElementRect): void;
  destroy(): void;
}

interface FrameCacheItem {
  frame: KAliveFrame;
  lastUsed: number;
}

export class FrameManager {
  private static readonly frameMap = new Map<string, FrameCacheItem>();
  private static MAX_CACHE_SIZE = 10; // 最大缓存数量

  private static updateLastUsed(uid: string): void {
    const item = this.frameMap.get(uid);
    if (item) {
      item.lastUsed = Date.now();
    }
  }

  private static enforceCacheLimit(): void {
    if (this.frameMap.size <= this.MAX_CACHE_SIZE) return;

    // 按最后使用时间排序
    const sortedFrames = Array.from(this.frameMap.entries())
      .sort(([, a], [, b]) => a.lastUsed - b.lastUsed);

    // 删除最旧的缓存，直到数量符合限制
    while (this.frameMap.size > this.MAX_CACHE_SIZE) {
      const [uid] = sortedFrames.shift()!;
      this.destroy(uid);
    }
  }

  static create(options: IFrameCreateOptions): IFrameInstance {
    const { uid } = options;
    const existingInstance = this.get(uid);
    if (existingInstance) {
      existingInstance.destroy();
    }
    const instance = new KAliveFrame(options);
    this.frameMap.set(uid, {
      frame: instance,
      lastUsed: Date.now()
    });
    this.enforceCacheLimit();
    return instance;
  }

  static destroy(uid: string): void {
    const item = this.frameMap.get(uid);
    if (!item) return;

    item.frame.destroy();
    this.frameMap.delete(uid);
  }

  static show(uid: string): void {
    const item = this.frameMap.get(uid);
    if (!item) return;

    item.frame.show();
    this.updateLastUsed(uid);
  }

  static hide(uid: string): void {
    const item = this.frameMap.get(uid);
    if (!item) return;

    item.frame.hide();
    this.updateLastUsed(uid);
  }

  static resize(uid: string, rect: HTMLElementRect): void {
    const item = this.frameMap.get(uid);
    if (!item) return;

    item.frame.resize(rect);
    this.updateLastUsed(uid);
  }

  static update(uid: string, src: string): void {
    const item = this.frameMap.get(uid);
    if (!item) return;

    item.frame.update(src);
    this.updateLastUsed(uid);
  }

  static get(uid: string): IFrameInstance | undefined {
    const item = this.frameMap.get(uid);
    if (item) {
      this.updateLastUsed(uid);
      return item.frame;
    }
    return undefined;
  }

  static clear(): void {
    this.frameMap.forEach(item => item.frame.destroy());
    this.frameMap.clear();
  }

  // 设置最大缓存数量
  static setMaxCacheSize(size: number): void {
    if (size < 1) {
      warn('缓存大小必须大于0');
      return;
    }
    this.MAX_CACHE_SIZE = size;
    this.enforceCacheLimit();
  }
}

// 创建IFrame实例
export class KAliveFrame implements IFrameInstance {
  private el: HTMLIFrameElement | null = null;
  private readonly options: IFrameOptions;
  private originalRect: HTMLElementRect = { width: 0, height: 0, top: 0, left: 0 };
  private scrollHandler: (() => void) | null = null;

  constructor(options: IFrameOptions) {
    this.options = options;
    this.init();
  }

  private init(): void {
    const { src, attrs, onLoaded, onError, keepAlive, container, parentContainer } = this.options;
    
    if (!src) {
      warn('请填写iframe的src');
      return;
    }

    try {
      this.el = document.createElement("iframe");
      this.el.src = src;
      this.el.classList.add('keep-alive-frame');
      
      if (onLoaded) {
        this.el.onload = onLoaded;
      }
      
      if (onError) {
        this.el.onerror = onError;
      }

      this.setAttrs(attrs);
      this.resize(this.options);

      // 根据 keepAlive 属性决定 iframe 的放置位置
      if (keepAlive) {
        document.body.appendChild(this.el);
        
        // 如果有父容器，添加滚动监听
        if (parentContainer) {
          this.addScrollListener(parentContainer);
        }
      } else if (container) {
        container.appendChild(this.el);
      }
    } catch (error) {
      warn(`初始化iframe失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  resize(rect: HTMLElementRect): void {
    if (!this.el) return;

    const { left, top, width, height } = rect;
    
    // 保存原始位置信息
    this.originalRect = { left, top, width, height };
    
    // 只在 keepAlive 模式下设置定位
    if (this.options.keepAlive) {
      // 如果有父容器，需要考虑滚动偏移量
      if (this.options.parentContainer) {
        const scrollTop = this.options.parentContainer.scrollTop;
        const scrollLeft = this.options.parentContainer.scrollLeft;
        
        this.setStyle({
          position: "fixed",
          left: `${left - scrollLeft}px`,
          top: `${top - scrollTop}px`,
          width: `${width}px`,
          height: `${height}px`,
        });
      } else {
        this.setStyle({
          position: "fixed",
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
        });
      }
    } else {
      this.setStyle({
        width: "100%",
        height: "100%",
      });
    }
  }

  destroy(): void {
    if (!this.el) return;

    this.el.onload = null;
    this.el.onerror = null;
    this.el.remove();
    this.el = null;

    // 清理滚动事件监听器
    if (this.scrollHandler && this.options.parentContainer) {
      this.options.parentContainer.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
  }

  show(): void {
    if (!this.el) return;
    this.el.classList.remove('is-hidden');
  }

  hide(): void {
    if (!this.el) return;
    this.el.classList.add('is-hidden');
  }

  update(src: string): void {
    if (!this.el) return;
    this.el.src = src;
  }

  private setStyle(style: StyleValue): void {
    if (!this.el) return;
    Object.assign(this.el.style, style);
  }

  private setAttrs(attrs: IFrameOptions['attrs']): void {
    if (!this.el) return;

    Object.entries(attrs).forEach(([key, value]) => {
      if (this.el) {
        this.el.setAttribute(key, String(value));
      }
    });
  }

  private addScrollListener(container: HTMLElement): void {
    if (!this.el) return;

    this.scrollHandler = () => {
      if (!this.el || !this.options.keepAlive) return;
      
      const scrollTop = container.scrollTop;
      const scrollLeft = container.scrollLeft;
      
      // 基于原始位置和滚动偏移量重新计算位置
      this.setStyle({
        position: "fixed",
        left: `${this.originalRect.left - scrollLeft}px`,
        top: `${this.originalRect.top - scrollTop}px`,
        width: `${this.originalRect.width}px`,
        height: `${this.originalRect.height}px`
      });
    };

    container.addEventListener('scroll', this.scrollHandler);
  }

  getEl () {
    return this.el;
  }
}

let id = 0;
export function generateId(): string {
  return `iframe_${id++}`;
}

function warn(msg: string): void {
  console.error(`[KAliveFrame]: ${msg}`);
}
