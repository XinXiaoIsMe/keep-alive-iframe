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
  attrs: Record<string, any>;
  onLoaded?: (e: Event) => void;
  onError?: (e: Event | string) => void;
}

// 管理IFrame实例
export class FrameManager {
  static readonly frameMap = new Map<string, KeepAliveFrame>();

  static create(options: IFrameOptions) {
    const { uid } = options;
    let instance = this.get(uid);
    if (instance) instance.destroy();
    instance = new KeepAliveFrame(options);
    this.frameMap.set(uid, instance);
  }

  static destroy(uid: string) {
    const instance = this.get(uid);
    if (!instance) return;

    instance.destroy();
    this.frameMap.delete(uid);
  }

  static show(uid: string) {
    const instance = this.get(uid);
    instance?.show();
  }

  static hide(uid: string) {
    const instance = this.get(uid);
    instance?.hide();
  }

  static resize(uid: string, rect: HTMLElementRect) {
    const instance = this.get(uid);
    instance?.resize(rect);
  }

  static update (uid: string, src: string) {
    const instance = this.get(uid);
    instance?.update(src);
  }

  static get(uid: string) {
    return this.frameMap.get(uid);
  }

  static clear() {
    for (const instance of Object.values(this.frameMap)) {
      instance.destroy();
    }

    this.frameMap.clear();
  }
}

// 创建IFrame实例
export class KeepAliveFrame {
  el: HTMLIFrameElement | null = null;
  private readonly _options: IFrameOptions;
  constructor(options: IFrameOptions) {
    this._options = options;
    this.init();
  }

  init() {
    const {
      src,
      attrs,
      onLoaded,
      onError
    } = this._options;
    if (!src) {
      warn('请填写iframe的src');
      return;
    }

    this.el = document.createElement("iframe");
    this.el.src = src;
    this.el.classList.add('keep-alive-frame');
    onLoaded && (this.el.onload = onLoaded);
    onError && (this.el.onerror = onError);
    this.setAttrs(attrs);
    this.resize(this._options);
    document.body.appendChild(this.el);
  }

  resize(rect: HTMLElementRect) {
    const { left, top, width, height } = rect;
    this.setStyle({
      position: "fixed",
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px",
    });
  }

  destroy() {
    if (!this.el) return;
    this.el.onload = null;
    this.el.onerror = null;
    this.el.remove();
    this.el = null;
  }

  show() {
    if (!this.el) return;

    this.el.classList.remove('is-hidden');
  }

  hide() {
    if (!this.el) return;

    this.el.classList.add('is-hidden');
  }

  update (src: string) {
    if (!this.el) return;
    this.el.src = src;
  }

  setStyle(style: StyleValue) {
    if (!this.el) return;
    Object.assign(this.el.style, style);
  }

  setAttrs(attrs: IFrameOptions['attrs']) {
    if (!this.el) return;

    Object.entries(attrs).forEach(([key, value]) => {
      this.el!.setAttribute(key, value);
    })
  }
}

let id = 0;
export function generateId() {
  return `iframe_${id ++}`;
}

function warn(msg: string) {
  console.error(`[KeepAliveFrame]: ${msg}`);
}
