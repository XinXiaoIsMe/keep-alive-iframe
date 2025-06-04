import type { StyleValue } from "vue";

export interface IFrameRect {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface IFrameOptions extends IFrameRect {
  uid: string;
  src: string;
  onLoaded?: () => void;
  onError?: (error?: string | Event) => void;
}

// 管理IFrame实例
export class FrameManager {
  static readonly frameMap = new Map<string, KeepAliveFrame>();

  static create (options: IFrameOptions) {
    const { uid } = options;
    let instance = this.get(uid);
    if (instance) instance.destroy();
    instance = new KeepAliveFrame(options);
    this.frameMap.set(uid, instance);
  }

  static destroy (uid: string) {
    const instance = this.get(uid);
    if (!instance) return;

    instance.destroy();
    this.frameMap.delete(uid);
  }

  static show (uid: string) {
    const instance = this.get(uid);
    instance?.show();
  }

  static hide (uid: string) {
    const instance = this.get(uid);
    instance?.hide();
  }

  static resize (uid: string, rect: IFrameRect) {
    const instance = this.get(uid);
    instance?.resize(rect);
  }

  static get (uid: string) {
    return this.frameMap.get(uid);
  }

  static clear () {
    for (const instance of Object.values(this.frameMap)) {
      instance.destroy();
    }

    this.frameMap.clear();
  }
}

// 创建IFrame实例
export class KeepAliveFrame {
  el: HTMLIFrameElement | null = null;
  private readonly _options : IFrameOptions;
  constructor(options: IFrameOptions) {
    this._options = options;
    this.init();
  }

  init () {
    const {
      src,
      onLoaded,
      onError
    } = this._options;
    this.el = document.createElement("iframe");
    this.el.src = src;
    onLoaded && (this.el.onload = onLoaded);
    onError && (this.el.onerror = onError);
    this.resize(this._options);
    document.body.appendChild(this.el);
  }

  resize(rect: IFrameRect) {
    const { left, top, width, height } = rect;
    this.setStyle({
      position: "fixed",
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px",
    });
  }

  destroy () {
    if (!this.el) return;
    this.el.remove();
  }

  show () {
    if (!this.el) return;
    this.el.classList.remove('hidden');
  }

  hide () {
    if (!this.el) return;
    this.el.classList.add('hidden');
  }

  setStyle(style: StyleValue) {
    if (!this.el) return;
    Object.assign(this.el.style, style);
  }
}

export function generateId() {
  return `iframe_${Date.now()}`;
}
