import { resolve } from 'path'
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  test: {
    browser: {
      enabled: true,
      name: "chromium",
      provider: playwright({
        launchOptions: process.env.ARIBB24_CHROME_BIN
          ? { executablePath: process.env.ARIBB24_CHROME_BIN }
          : undefined,
      }),
      instances: [
        { browser: 'chromium' },
      ],
      headless: true,
      viewport: { width: 960, height: 540 }
    },
    include: [
      './test/e2e/**/*.ts',
    ]
  }
});
