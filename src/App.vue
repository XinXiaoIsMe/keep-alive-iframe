<template>
  <div flex="~ col" w-100vw h-100vh p-20px box-border>
    <div m-b-10px>
      <router-link class="btn" to="/pinia">Pinia</router-link>
      <router-link class="btn m-l-10px" to="/vue_router">VueRouter</router-link>
      <router-link class="btn m-l-10px" to="/search">Search</router-link>
      <router-link class="btn m-l-10px" to="/frame_cache_test">缓存测试</router-link>
    </div>
    <router-view v-slot="{ Component }">
      <KeepAlive>
        <component class="flex-1 border-[#ccc] border-solid border-1px" :is="Component" />
      </KeepAlive>
    </router-view>
  </div>
</template>

<style>
body, html {
  margin: 0;
}

iframe {
  border: none;
  outline: none;
}
</style>
