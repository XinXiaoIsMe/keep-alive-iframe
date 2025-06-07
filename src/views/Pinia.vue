<template>
  <KeepAliveFrame src="https://pinia.vuejs.org/" :iframe-attrs="attrs" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { KeepAliveFrame } from '../components';

const attrs = ref({
  title: 'Pinia'
});
</script>
