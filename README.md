
# `KeepAliveFrame.vue`

> 🧊 **一个支持 KeepAlive 的 iframe 渲染组件**，通过将 `<iframe>` 挂载至 `body` 实现“伪持久化”，解决切换路由或页面时 iframe 被销毁的问题。

---

## ✨ 功能亮点

- 💾 iframe 保持状态不被销毁（如登录态、播放进度）
- 💡 组件只负责布局和容器尺寸，真正 iframe 挂载在 body 中
- 📐 自动监听组件大小变化，动态调整 iframe 尺寸
- 🪢 支持 KeepAlive 场景中组件激活/休眠时的事件钩子

---

## 🛠 使用方法

```vue
<KeepAliveFrame
  :src="iframeUrl"
  :iframeAttrs="{ allow: 'clipboard-read; clipboard-write' }"
  @load="onLoad"
  @error="onError"
  @resize="onResize"
/>
```

---

## ⚙️ Props

| Prop         | Type                   | Default | Description                                      |
|--------------|------------------------|---------|--------------------------------------------------|
| `src`        | `string`               | —       | iframe 加载地址                                  |
| `keepAlive`  | `boolean`              | `true`  | 是否启用 KeepAlive 模式                         |
| `iframeAttrs`| `Record<string, any>`  | `{}`    | 传递给 iframe 元素的原生属性（如 allow、sandbox）|

---

## 📣 Emits

| Event         | Params              | Description                          |
|---------------|---------------------|--------------------------------------|
| `load`        | `()`                | iframe 加载完成                       |
| `error`       | `(error: any)`      | iframe 加载失败                       |
| `activated`   | `()`                | 组件被 KeepAlive 激活时触发          |
| `deactivated` | `()`                | 组件被 KeepAlive 暂存时触发          |
| `destroy`     | `()`                | iframe 被销毁时触发                   |
| `resize`      | `(rect: DOMRect)`   | iframe 容器尺寸变化时触发            |

---

## 🧬 expose 方法

```ts
getFrame(): HTMLIFrameElement | undefined
```

- 用于获取当前实际的 iframe DOM 元素（挂载在 `body` 中），便于手动控制。

---

## 🔍 组件原理说明

- **iframe 脱离组件 DOM，统一挂载到 body 中**，通过 `FrameManager` 管理生命周期
- **容器只是一个虚位容器**，用于检测位置和尺寸，iframe 绝对定位于对应位置
- 使用 `vueuse` 的 `useResizeObserver` 监听大小变化
- 生命周期中调用 `FrameManager.create/update/destroy` 管理 iframe 实例

---

## 🧱 依赖项

- Vue 3
- `@vueuse/core` 用于 resize 监听与节流
- `@iconify/vue` 用于加载动画图标（可根据需求替换）

---

## 📁 文件结构建议

```
components/
├── KeepAliveFrame.vue
├── core.ts  ← 包含 FrameManager / generateId 等 iframe 管理逻辑
```

---

## 🔒 注意事项

- `iframe` 内容必须允许跨域访问或设置 `document.domain` 以避免跨域限制
- 该组件并不会在 DOM 中渲染 `<iframe>`，iframe 将脱离插槽控制，仅用于视觉显示
