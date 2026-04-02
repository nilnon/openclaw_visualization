import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    open: true,
    cors: true,  // 启用 CORS
    proxy: {
      // 不代理 WebSocket，让浏览器直连
      // 如果 CORS 问题，请在 Gateway 配置 allowedOrigins
    }
  }
});
