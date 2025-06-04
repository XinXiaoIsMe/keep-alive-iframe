import { useResizeObserver, type MaybeRef } from "@vueuse/core";
import { type Ref, type StyleValue, ref, watch } from "vue";

// 管理IFrame实例
export class FrameManager {
  static readonly frameMap = new Map<string, KeepAliveFrame>();

  static create (id: string, container: MaybeRef<HTMLElement | null>, src: MaybeRef<string>) {
    let instance = this.get(id);
    if (instance) instance.remove();
    instance = new KeepAliveFrame(container, src);
    instance.create();
    this.frameMap.set(id, instance);
  }

  static remove (id: string) {
    const instance = this.get(id);
    if (!instance) return;

    instance.remove();
    this.frameMap.delete(id);
  }

  static get (id: string) {
    return this.frameMap.get(id);
  }

  static clear () {
    for (const instance of Object.values(this.frameMap)) {
      instance.remove();
    }

    this.frameMap.clear();
  }
}

// 创建IFrame实例
export class KeepAliveFrame {
  private readonly containerRef: Ref<HTMLElement | null>;
  private readonly srcRef: Ref<string>;
  el: HTMLIFrameElement | null = null;
  constructor(container: MaybeRef<HTMLElement | null>, src: MaybeRef<string>) {
    this.containerRef = ref(container);
    this.srcRef = ref(src);

    // 监听容器大小变化，更新iframe
    useResizeObserver(
      this.containerRef,
      () => {
        this.update();
      }
    );

    // 监听src变化，更新iframe
    watch(this.srcRef, (newSrc) => {
      if (!this.el) return;
      this.el.src = newSrc;
    });
  }

  get container() {
    return this.containerRef.value;
  }

  get src() {
    return this.srcRef.value;
  }

  create() {
    this.el = document.createElement("iframe");
    this.el.src = this.src;
    this.update();
    document.body.appendChild(this.el);
  }

  update() {
    if (!this.container) return;

    const { left, top, width, height } = this.container.getBoundingClientRect();
    this.setStyle({
      position: "fixed",
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px",
    });
  }

  remove () {
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
