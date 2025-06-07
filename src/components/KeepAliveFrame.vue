<template>
    <div ref="iframeContainerRef" flex="~" items-center justify-center>
        <slot v-if="!src">
            请输入iframe的地址
        </slot>
        <slot v-else-if="isLoading" name="isLoading">
            <Icon icon="eos-icons:bubble-loading" width="40" height="40" />
        </slot>
        <slot v-else-if="isError">
            <div>
                出错了！
            </div>
        </slot>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onUnmounted, useTemplateRef, onDeactivated, onActivated } from 'vue';
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
}>(), {
    keepAlive: true
});

const emit = defineEmits<{
    load: [],
    error: [any],
    activited: [],
    deactivited: [],
    destroy: [],
    resize: [HTMLElementRect]
}>();

const iframeContainerRef = useTemplateRef('iframeContainerRef');
const uid = generateId();
const isLoading = ref(false);
const isError = ref(false);
let isReady = false;
let isActivited = false;

defineExpose({
    getFrame: () => FrameManager.get(uid)?.el
});

useResizeObserver(
    iframeContainerRef,
    useThrottleFn(resizeFrame, 300, true)
);

watch([() => props.src, iframeContainerRef], ([src, container]) => {
    if (src && container) {
        createFrame();
    } else {
        destroyFrame();
    }
});

onActivated(() => {
    isActivited = true;
    if (props.keepAlive) {
        showFrame();
        emit('activited');
        return;
    }

    createFrame();
    emit('activited');
});

onDeactivated(() => {
    isActivited = false;
    if (props.keepAlive) {
        hideFrame();
        emit('deactivited');
        return;
    }

    destroyFrame();
    emit('deactivited');
    isReady = false;
});

onUnmounted(() => {
    // 组件卸载时，移除iframe
    destroyFrame();
    isReady = false;
    emit('destroy');
});

function createFrame() {
    // src改变时，需要重新创建iframe，因此每次创建iframe时，先清空原有的iframe
    destroyFrame()
    isLoading.value = true;
    isError.value = false;
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
        attrs: props.iframeAttrs || {},
        onLoaded: handleLoad,
        onError: handleError
    });
}

function destroyFrame() {
    FrameManager.destroy(uid);
}

function showFrame() {
    FrameManager.show(uid);
}

function hideFrame() {
    FrameManager.hide(uid);
}

function resizeFrame() {
    FrameManager.resize(uid, getContainerRect());
    isReady && isActivited && emit('resize', getContainerRect());
}

function handleLoad() {
    isLoading.value = false;
    isReady = true;
    emit('load');
}

function handleError(err: any) {
    isLoading.value = false;
    isError.value = true;
    emit('error', err);
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