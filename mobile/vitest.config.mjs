import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node' },
  resolve: {
    alias: {
      'expo-crypto': new URL('./src/services/__tests__/expoCryptoStub.js', import.meta.url).pathname,
    },
  },
});
