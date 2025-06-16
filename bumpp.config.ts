import { defineConfig } from 'bumpp'

export default defineConfig({
  files: [
    'package.json',
    'dist/package.json',
  ],
  push: true,
  tag: true,
  commit: true,
  all: true,
}) 