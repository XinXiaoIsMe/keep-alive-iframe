<template>
  <div ref="iframeContainerRef" class="home"></div>
</template>

<script lang="ts" setup>
import { onActivated, onDeactivated, useTemplateRef, useAttrs } from 'vue';
import { addIframe, getIframe } from './IFrame';

const iframeContainerRef = useTemplateRef('iframeContainerRef')
const attrs = useAttrs()

const iframeId = 'iframe-1'

onActivated(() => {
  console.log('activated')
  let iframe = getIframe(iframeId);
  if (iframe && iframeContainerRef.value) {
    iframe.classList.remove('hidden')
  } else if (iframeContainerRef.value) {
    iframe = document.createElement('iframe')
    iframe.src = 'https://router.vuejs.org/guide/'
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'absolute';
    Object.keys(attrs).forEach(key => {
      iframe!.setAttribute(key, String(attrs[key]));
    });

    const {
      left,
      top,
      width,
      height
    } = iframeContainerRef.value.getBoundingClientRect();
    console.log(left, top, width, height);
    iframe.style.width = width + 'px';
    iframe.style.height = height + 'px';
    iframe.style.left = left + 'px';
    iframe.style.top = top + 'px';
    addIframe(iframeId, iframe);
    document.body.appendChild(iframe);
  }
})

onDeactivated(() => {
  const iframe = getIframe(iframeId)
  console.log(iframe, 'deactivated')
  if (!iframe) return;

  iframe.classList.add('hidden')
})
</script>

<style>
.home {
  position: relative;
}

.hidden {
  position: fixed;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  opacity: 0;
  border: none;
  pointer-events: none;
}
</style>
