// 导入 UnoCSS 样式
import 'virtual:uno.css';

// 导出所有核心功能
export * from './core';

// 导出 Vue 组件（具名导出）
export { default as KeepAliveFrame } from './KeepAliveFrame.vue';

// 导出 Vue 组件（默认导出）
import KeepAliveFrameComponent from './KeepAliveFrame.vue';
export default KeepAliveFrameComponent;