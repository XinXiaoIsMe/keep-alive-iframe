<template>
    <div ref="iframeContainerRef" class="relative w-full h-full" role="keep-alive-frame-container">
        <slot v-if="!src" name="empty">
            <div class="flex justify-center items-center w-full h-full text-gray-500">
                请输入iframe的地址
            </div>
        </slot>
        <slot v-else-if="isLoading" name="loading" :zIndex="zIndex + 1">
            <div class="w-full h-full absolute left-0 top-0 inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center" :style="{ zIndex: zIndex + 1 }">
                <div class="keep-alive-loading-spinner"></div>
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

const props = withDefaults(defineProps<{
    src: string;
    keepAlive?: boolean;
    iframeAttrs?: Record<string, any>;
    maxCacheSize?: number;
    parentContainer?: HTMLElement;
    zIndex?: number;
}>(), {
    keepAlive: true,
    maxCacheSize: 10,
    zIndex: 0
});

const emit = defineEmits<{
    load: [Event],
    error: [Event | string],
    activated: [],
    deactivated: [],
    destroy: [],
    resize: [HTMLElementRect],
    cacheHit: [],
    cacheMiss: [],
}>();

const iframeContainerRef = useTemplateRef('iframeContainerRef');
const uid = generateId();
const isLoading = ref(false);
const isError = ref(false);
let isReady = false;
let isActivated = false;

function ensureFrame() {
    const frame = FrameManager.get(uid);
    if (!frame && props.src) {
        createFrame();
    }
}

defineExpose({
    getFrame: () => FrameManager.get(uid)?.getEl()
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
        ensureFrame();
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
    ensureFrame();
    FrameManager.setMaxCacheSize(props.maxCacheSize);
});

onUnmounted(() => {
    destroyFrame();
    isReady = false;
    isActivated = false;
    emit('destroy');
});

function createFrame() {
    destroyFrame()
    isLoading.value = true;
    isError.value = false;
    const {
        width,
        height,
        left,
        top
    } = getContainerRect();

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
        zIndex: props.zIndex || 0,
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
        createFrame();
    }
}

function showFrame() {
    const frame = FrameManager.get(uid);
    if (frame) {
        FrameManager.show(uid);
    } else {
        createFrame();
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
}

/* CSS Loading Spinner */
.keep-alive-loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: keep-alive-spin 1s linear infinite;
}

@keyframes keep-alive-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>