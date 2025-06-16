import { defineConfig } from 'changelogithub'

export default defineConfig({
  types: {
    feat: { title: '🚀 Features' },
    fix: { title: '🐞 Bug Fixes' },
    docs: { title: '📖 Documentation' },
    style: { title: '🎨 Styles' },
    refactor: { title: '♻️ Refactors' },
    perf: { title: '⚡ Performance' },
    test: { title: '🧪 Tests' },
    build: { title: '📦 Build' },
    ci: { title: '🤖 CI' },
    chore: { title: '🔧 Chore' },
    revert: { title: '⏪ Reverts' },
  },
  capitalize: true,
  group: true,
}) 