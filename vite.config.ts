import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue()],
  build: { manifest: true },
  test: { environment: 'jsdom', include: ['tests/unit/**/*.spec.ts'] },
})
