export const iframeMap = new Map<string, HTMLIFrameElement>();

export function addIframe (key: string, iframe: HTMLIFrameElement) {
  iframeMap.set(key, iframe);
}

export function getIframe (key: string) {
  return iframeMap.get(key);
}
