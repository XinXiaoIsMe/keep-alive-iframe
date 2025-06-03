<template>
    <div ref="iframeContainerRef" class="keep-alive-frame"></div>
</template>

<script lang="ts" setup>
import { onActivated, onDeactivated, onUnmounted, useTemplateRef } from 'vue';
import { useIframeManager, useIframe, generateId } from './IFrame';

const props = defineProps<{
    src: string;
}>();

const iframeContainerRef = useTemplateRef('iframeContainerRef');
const { addIframe, removeIframe, getIframe } = useIframeManager();
const { createIframe } = useIframe(iframeContainerRef, props.src);
const iframeId = generateId();

onActivated(() => {
    let iframe = getIframe(iframeId);
    if (iframe && iframeContainerRef.value) {
        iframe.classList.remove('hidden')
        return;
    }

    if (iframeContainerRef.value) {
        iframe = createIframe();
        addIframe(iframeId, iframe);
        document.body.appendChild(iframe);
    }
});

onDeactivated(() => {
    const iframe = getIframe(iframeId);
    if (!iframe) return;

    iframe.classList.add('hidden');
});

onUnmounted(() => {
    removeIframe(iframeId);
});
</script>

<style>
.keep-alive-frame {
    position: relative;
}

iframe.hidden {
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