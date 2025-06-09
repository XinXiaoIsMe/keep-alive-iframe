<template>
    <div ref="iframeContainerRef" class="relative w-full h-full" role="keep-alive-frame-container">
        <slot v-if="!src" name="empty">
            <div class="flex justify-center items-center w-full h-full text-gray-500">
                请输入iframe的地址
            </div>
        </slot>
        <slot v-else-if="isLoading" name="loading">
            <div class="absolute inset-0 bg-white/80 backdrop-blur-sm z-1 flex items-center justify-center">
                <div class="flex items-center justify-center w-full h-full">
                    <Icon icon="eos-icons:bubble-loading" width="40" height="40" />
                </div>
            </div>
        </slot>
        <slot v-else-if="isError" name="error">
            <div class="flex justify-center items-center w-full h-full text-gray-500">
                出错了！
            </div>
        </slot>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onUnmounted, onMounted, useTemplateRef, onDeactivated, onActivated } from 'vue';
import { useResizeObserver, useThrottleFn } from '@vueuse/core';
import { type HTMLElementRect, FrameManager, generateId } from './core';
import { Icon } from '@iconify/vue';

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

const props = withDefaults(defineProps<{
    src: string;
    keepAlive?: boolean;
    iframeAttrs?: Record<string, any>;
    maxCacheSize?: number; // 最大缓存数量
    parentContainer?: HTMLElement; // 父容器，用于监听滚动事件
}>(), {
    keepAlive: true,
    maxCacheSize: 10
});

const emit = defineEmits<{
    load: [Event],
    // 由于浏览器的安全策略，error事件通常不会触发
    error: [Event | string],
    activated: [],
    deactivated: [],
    destroy: [],
    resize: [HTMLElementRect],
    cacheHit: [], // 缓存命中事件
    cacheMiss: [], // 缓存未命中事件
}>();

const iframeContainerRef = useTemplateRef('iframeContainerRef');
const uid = generateId();
const isLoading = ref(false);
const isError = ref(false);
// iframe是否加载完成
let isReady = false;
// KeepAliveFrame是否处于激活状态
let isActivated = false;

// 检查iframe是否存在，如果不存在则重新创建
function ensureFrame() {
    const frame = FrameManager.get(uid);
    if (!frame && props.src) {
        createFrame();
    }
}

defineExpose({
    getFrame: () => FrameManager.get(uid)?.el
});

useResizeObserver(
    iframeContainerRef,
    useThrottleFn(resizeFrame, 300, true)
);

watch(iframeContainerRef, (container) => {
    if (props.src && container) {
        createFrame();
    } else {
        destroyFrame();
    }
});

watch(() => props.src, src => {
    updateFrame(src);
});

watch(() => props.maxCacheSize, maxCacheSize => {
    FrameManager.setMaxCacheSize(maxCacheSize);
});

onActivated(() => {
    isActivated = true;
    if (props.keepAlive) {
        ensureFrame(); // 确保iframe存在
        showFrame();
        emit('activated');
        return;
    }

    createFrame();
    emit('activated');
});

onDeactivated(() => {
    isActivated = false;
    if (props.keepAlive) {
        hideFrame();
        emit('deactivated');
        return;
    }

    destroyFrame();
    emit('deactivated');
    isReady = false;
});

onMounted(() => {
    isActivated = true;
    ensureFrame(); // 确保iframe存在
    // 设置最大缓存数量
    FrameManager.setMaxCacheSize(props.maxCacheSize);
});

onUnmounted(() => {
    // 组件卸载时，移除iframe
    destroyFrame();
    isReady = false;
    isActivated = false;
    emit('destroy');
});

function createFrame() {
    // 每次创建iframe时，先清空原有的iframe，防止iframe可能出现的堆积
    destroyFrame()
    isLoading.value = true;
    isError.value = false;
    const {
        width,
        height,
        left,
        top
    } = getContainerRect();

    // 检查是否命中缓存
    const existingFrame = FrameManager.get(uid);
    if (existingFrame) {
        emit('cacheHit');
    } else {
        emit('cacheMiss');
    }

    FrameManager.create({
        uid,
        width,
        height,
        left,
        top,
        src: props.src,
        attrs: props.iframeAttrs || {},
        onLoaded: handleLoad,
        onError: handleError,
        keepAlive: props.keepAlive,
        container: props.keepAlive ? undefined : iframeContainerRef.value,
        parentContainer: props.parentContainer
    });
}

function destroyFrame() {
    FrameManager.destroy(uid);
}

function updateFrame(src: string) {
    const frame = FrameManager.get(uid);
    if (frame) {
        FrameManager.update(uid, src);
    } else {
        createFrame(); // 如果iframe不存在，重新创建
    }
}

function showFrame() {
    const frame = FrameManager.get(uid);
    if (frame) {
        FrameManager.show(uid);
    } else {
        createFrame(); // 如果iframe不存在，重新创建
    }
}

function hideFrame() {
    const frame = FrameManager.get(uid);
    frame && FrameManager.hide(uid);
}

function resizeFrame() {
    FrameManager.resize(uid, getContainerRect());
    isReady && isActivated && emit('resize', getContainerRect());
}

function handleLoad(e: Event) {
    isLoading.value = false;
    isReady = true;
    emit('load', e);
}

function handleError(e: Event | string) {
    isLoading.value = false;
    isError.value = true;
    emit('error', e);
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
    border: none;
    background: white;
    width: 100%;
    height: 100%;
}

.keep-alive-frame.is-hidden {
    display: none;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
}
</style>