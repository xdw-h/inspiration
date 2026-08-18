import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  build: { manifest: true },
  test: { environment: 'jsdom', include: ['tests/unit/**/*.spec.ts'] },
})
