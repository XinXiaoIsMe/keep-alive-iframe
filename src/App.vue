<template>
  <div class="app-container">
    <div>
      <router-link to="/home">Home</router-link>
      <router-link to="/nav">Nav</router-link>
    </div>
    <router-view v-slot="{ Component }">
      <KeepAlive>
        <component class="page" :is="Component" />
      </KeepAlive>
    </router-view>
  </div>
</template>

<style>
body, html {
  margin: 0;
}

#app {
  width: 100vw;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.page {
  flex: 1;
  border: 1px solid #ccc;
}
</style>
