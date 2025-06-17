import { defineConfig, presetWind3, presetAttributify } from 'unocss';

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify()
  ],
  shortcuts: {
    btn: 'px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 border-none outline-none decoration-none transition-colors cursor-pointer',
    'btn-sm': 'px-2 py-0.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 border-none outline-none decoration-none transition-colors cursor-pointer',
    'input-field': 'px-3 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400 outline-none transition-all duration-200 ease-in-out',
  },
})
