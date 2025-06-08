<template>
  <div class="page-root">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="button-group">
        <button btn @click="addFrame('baidu')">添加百度</button>
        <button btn @click="addFrame('sogou')">添加搜狗</button>
        <button btn @click="addFrame('bilibili')">添加Bilibili</button>
        <button btn @click="addFrame('huya')">添加虎牙</button>
        <button btn @click="addFrame('element')">添加ElementPlus</button>
      </div>
      <div class="cache-control">
        <span>最大缓存数量：</span>
        <input 
          type="number" 
          v-model="maxCacheSize" 
          min="1" 
          max="10"
          class="cache-input"
        />
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-panel">
      <div class="stat-item">
        <span>缓存命中：</span>
        <span class="text-green-500 font-medium">{{ cacheHits }}</span>
      </div>
      <div class="stat-item">
        <span>缓存未命中：</span>
        <span class="text-red-500 font-medium">{{ cacheMisses }}</span>
      </div>
      <div class="stat-item">
        <span>当前缓存数：</span>
        <span class="text-blue-500 font-medium">{{ frames.length }}</span>
      </div>
    </div>

    <!-- iframe 容器 -->
    <div class="frames-wrapper">
      <div 
        class="frames-grid"
        :style="{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gap: '1rem'
        }"
      >
        <div 
          v-for="frame in frames" 
          :key="frame.id" 
          class="frame-container"
        >
          <div class="frame-header">
            <span class="font-medium">{{ frame.name }}</span>
            <button btn-sm @click="removeFrame(frame.id)">移除</button>
          </div>
          <div class="frame-content">
            <KeepAliveFrame
              class="keep-alive-frame-container"
              :src="frame.url"
              :max-cache-size="maxCacheSize"
              @cache-hit="handleCacheHit"
              @cache-miss="handleCacheMiss"
              @load="handleLoad"
              @error="handleError"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { KeepAliveFrame } from '../components';
import { generateId } from '../components/core';

const FRAMES = {
  baidu: { name: '百度', url: 'https://www.baidu.com' },
  sogou: { name: '搜狗', url: 'https://www.sogou.com' },
  bilibili: { name: 'Bilibili', url: 'https://www.bilibili.com/' },
  huya: { name: '虎牙', url: 'https://www.huya.com/' },
  element: { name: 'ElementPlus', url: 'https://element-plus.org/zh-CN/component/overview.html' }
} as const;

interface Frame {
  id: string;
  name: string;
  url: string;
}

const frames = ref<Frame[]>([]);
const maxCacheSize = ref(6);
const cacheHits = ref(0);
const cacheMisses = ref(0);

// 根据屏幕宽度动态计算网格列数
const gridCols = computed(() => {
  const width = window.innerWidth;
  if (width >= 1920) return 4;
  if (width >= 1440) return 3;
  if (width >= 1024) return 2;
  return 1;
});

function addFrame(type: keyof typeof FRAMES) {
  const frame = FRAMES[type];
  frames.value.push({
    id: generateId(),
    name: frame.name,
    url: frame.url
  });
}

function removeFrame(id: string) {
  frames.value = frames.value.filter(frame => frame.id !== id);
}

function handleCacheHit() {
  cacheHits.value++;
  console.log('缓存命中');
}

function handleCacheMiss() {
  cacheMisses.value++;
  console.log('缓存未命中');
}

function handleLoad() {
  console.log('iframe 加载完成');
}

function handleError(error: Event | string) {
  console.error('iframe 加载失败:', error);
}
</script>

<style scoped>
.page-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.control-panel {
  display: flex;
  padding: 4px;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-shrink: 0;
}

.button-group {
  display: flex;
  gap: 8px;
}

.cache-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.cache-input {
  width: 40px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0 8px;
}

.stats-panel {
  display: flex;
  gap: 16px;
  padding: 4px;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.frames-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f9fafb;
  position: relative;
  min-height: 0;
}

.frames-grid {
  display: grid;
  gap: 1.5rem;
  padding-bottom: 1rem;
  position: relative;
}

.frame-container {
  @apply bg-white rounded shadow-sm overflow-hidden;
  height: 500px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.frame-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.frame-content {
  flex: 1;
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  background-color: #f3f4f6;
  overflow: hidden;
}

.frame-content :deep(.keep-alive-frame-container) {
  flex: 1;
  width: 100%;
  height: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  position: relative;
}

.frame-content :deep(iframe) {
  width: 100%;
  height: 100%;
  border: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors;
}

.btn-sm {
  @apply px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm;
}
</style> 