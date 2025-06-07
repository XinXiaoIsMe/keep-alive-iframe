<template>
  <KeepAliveFrame src="https://pinia.vuejs.org/" :iframe-attrs="attrs" @load="handleLoad" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { KeepAliveFrame } from '../components';

const attrs = ref({
  title: 'Pinia'
});

function handleLoad () {
  console.log('加载成功！');
}
</script>
