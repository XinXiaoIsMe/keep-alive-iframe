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

const props = withDefaults(defineProps<{
    src: string;
    keepAlive?: boolean;
    iframeAttrs?: Record<string, any>;
    maxCacheSize?: number;
    parentContainer?: HTMLElement;
}>(), {
    keepAlive: true,
    maxCacheSize: 10
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
</style>