import { defineConfig, presetWind3, presetAttributify } from 'unocss';

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify()
  ],
  shortcuts: {
    btn: 'px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 border-none outline-none decoration-none',
  },
})
