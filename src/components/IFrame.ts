import { useElementSize } from "@vueuse/core";
import { type Ref, shallowRef, watch } from "vue";

export const iframeMap = new Map<string, HTMLIFrameElement>();

// 管理iframe元素
export function useIframeManager () {
  const addIframe = (key: string, iframe: HTMLIFrameElement) => {
    iframeMap.set(key, iframe);
  };

  const removeIframe = (key: string) => {
    const iframe = iframeMap.get(key);
    if (!iframe) return;
    iframeMap.delete(key);
    iframe.remove();
  };

  const getIframe = (key: string) => {
    return iframeMap.get(key);
  };

  return {
    addIframe,
    removeIframe,
    getIframe
  }
}

// 创建iframe等
export function useIframe (container: Ref<HTMLElement | null>, src: string) {
  const iframe = shallowRef<HTMLIFrameElement>();
  const { width, height } = useElementSize(container);

  watch([width, height], ([w, h]) => {
    if (!iframe.value) return;
    // 容器尺寸改变时，更新iframe的大小
    updateIframeScale(w, h);
  });

  const createIframe = () => {
    iframe.value = document.createElement('iframe');
    const { left, top, width, height } = container.value!.getBoundingClientRect();
    
    iframe.value.src = src;
    iframe.value.style.position = 'fixed';
    iframe.value.style.left = left + "px";
    iframe.value.style.top = top + "px";
    iframe.value.style.width = width + "px";
    iframe.value.style.height = height + "px";
    
    return iframe.value;
  };

  const updateIframeScale = (width: number, height: number) => {
    if (!iframe.value) return;
    iframe.value.style.width = width + "px";
    iframe.value.style.height = height + "px";
  }

  return {
    iframe,
    createIframe,
    updateIframeScale
  }
}

export function generateId () {
  return `iframe_${Date.now()}`;
}
