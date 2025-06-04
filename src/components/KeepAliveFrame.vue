<template>
    <div ref="iframeContainerRef" class="keep-alive-frame">
        <div v-if="loading">加载中...</div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onActivated, onDeactivated, onUnmounted, useTemplateRef } from 'vue';
import { useResizeObserver, useThrottleFn } from '@vueuse/core';
import { FrameManager, generateId } from './IFrame';

/**
 * 开发思路：
 * 1. 为了解决页面切换后iframe刷新的问题，将iframe放在body中，单独管理
 * 2. 使用KeepAliveFrame占位，获取iframe的位置和大小信息
 * 3. 利用这些信息创建iframe，插入到body中，并使用IFrameManager管理
 * 
 * 代码设计
 * 自顶向下，由组件调用IFrameManager的函数完成渲染等操作，IFrameManager再调用缓存的对应IFrame的实例方法完成最终渲染等
 * 组件渲染 => IFrameManager.create => iframe = new KeepAliveFrame()
 * 组件更新 => IFrameManager.update => iframe.update
 * 组件销毁 => IFrameManager.destroy => iframe.destroy
 */

interface HTMLElementRect {
    width: number;
    height: number;
    top: number;
    left: number;
}

const props = defineProps<{
    src: string;
}>();

const iframeContainerRef = useTemplateRef('iframeContainerRef');
const uid = generateId();
const loading = ref(false);

useResizeObserver(
    iframeContainerRef,
    useThrottleFn(resizeFrame, 300, true)
);

onActivated(() => {
    const frameInstance = FrameManager.get(uid);
    // 如果存在iframe，则直接展示
    if (frameInstance && iframeContainerRef.value) {
        showFrame();
        return;
    }

    // 不存在时，新建iframe，插入body中
    if (iframeContainerRef.value) {
        createFrame();
    }
});

onDeactivated(() => {
    hideFrame();
});

onUnmounted(() => {
    // 组件卸载时，移除iframe
    destroyFrame();
});

function createFrame() {
    loading.value = true;
    const {
        width,
        height,
        left,
        top
    } = getContainerRect();
    FrameManager.create({
        uid,
        width,
        height,
        left,
        top,
        src: props.src,
        onLoaded () {
            loading.value = false;
        },
        onError () {
            loading.value = false;
        }
    });
}

function destroyFrame () {
    FrameManager.destroy(uid);
}

function resizeFrame () {
    FrameManager.resize(uid, getContainerRect());
}

function showFrame () {
    FrameManager.show(uid);
}

function hideFrame () {
    FrameManager.hide(uid);
}

function getContainerRect(): HTMLElementRect {
    return iframeContainerRef.value?.getBoundingClientRect() || {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    };
}
</script>

<style>
.keep-alive-frame {
    display: flex;
    justify-content: center;
    align-items: center;
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