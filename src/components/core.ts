import type { StyleValue } from "vue";

export interface HTMLElementRect {
  width: number;
  height: number;
  top: number;
  left: number;
}

export interface IFrameOptions extends HTMLElementRect {
  uid: string;
  src: string;
  attrs: Record<string, string | number | boolean>;
  onLoaded?: (e: Event) => void;
  onError?: (e: Event | string) => void;
  keepAlive?: boolean;
  container?: HTMLElement;
}

interface FrameCacheItem {
  frame: KeepAliveFrame;
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

  static create(options: IFrameOptions): void {
    const { uid } = options;
    const existingInstance = this.get(uid);
    if (existingInstance) {
      existingInstance.destroy();
    }
    const instance = new KeepAliveFrame(options);
    this.frameMap.set(uid, {
      frame: instance,
      lastUsed: Date.now()
    });
    this.enforceCacheLimit();
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

  static get(uid: string): KeepAliveFrame | undefined {
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
export class KeepAliveFrame {
  private el: HTMLIFrameElement | null = null;
  private readonly options: IFrameOptions;

  constructor(options: IFrameOptions) {
    this.options = options;
    this.init();
  }

  private init(): void {
    const { src, attrs, onLoaded, onError, keepAlive, container } = this.options;
    
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
    
    // 只在 keepAlive 模式下设置定位
    if (this.options.keepAlive) {
      this.setStyle({
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      });
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
}

let id = 0;
export function generateId(): string {
  return `iframe_${id++}`;
}

function warn(msg: string): void {
  console.error(`[KeepAliveFrame]: ${msg}`);
}
