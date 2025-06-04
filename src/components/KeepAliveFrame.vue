<template>
    <div ref="iframeContainerRef" class="keep-alive-frame"></div>
</template>

<script lang="ts" setup>
import { onActivated, onDeactivated, onUnmounted, useTemplateRef, toRef } from 'vue';
import { FrameManager, generateId } from './IFrame';

const props = defineProps<{
    src: string;
}>();

const iframeContainerRef = useTemplateRef('iframeContainerRef');
const iframeId = generateId();

onActivated(() => {
    const frameInstance = FrameManager.get(iframeId);
    // 如果存在iframe，则直接展示
    if (frameInstance && iframeContainerRef.value) {
        frameInstance.show()
        return;
    }

    // 不存在时，新建iframe，插入body中
    if (iframeContainerRef.value) {
        FrameManager.create(iframeId, iframeContainerRef, toRef(props, 'src'));
    }
});

onDeactivated(() => {
    const frameInstance = FrameManager.get(iframeId);
    if (!frameInstance) return;

    // 组件未激活时，隐藏iframe
    frameInstance.hide();
});

onUnmounted(() => {
    // 组件卸载时，移除iframe
    FrameManager.remove(iframeId);
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