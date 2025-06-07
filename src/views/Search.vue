<template>
  <div flex="~ col">
    <div p-4px>
      <button btn @click="toggleSearch(URLS.baidu)">百度</button>
      <button btn m-l-10px @click="toggleSearch(URLS.sougou)">搜狗</button>
      <button btn m-l-10px @click="toggle()">切换显示隐藏iframe</button>
    </div>
    <KeepAliveFrame v-if="visible" flex-1 :src="src" @load="handleLoad" @activited="handleActivited"
      @deactivited="handleDeactivited" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useToggle } from '@vueuse/core';
import { KeepAliveFrame } from '../components';

const URLS = {
  baidu: 'http://www.baidu.com',
  sougou: 'https://www.sogou.com/'
};

const src = ref(URLS.baidu);
const [visible, toggle] = useToggle(true);

function toggleSearch(address: string) {
  src.value = address;
}

function handleLoad() {
  console.log('loaded');
}

function handleActivited() {
  console.log('activited');
}

function handleDeactivited() {
  console.log('deactivited');
}
</script>
