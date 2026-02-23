import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. Payment Service (MSA)
      '/api/payments': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      // 2. Recommendation Service (MSA)
      '/api/v1/recommendations': {
        target: 'http://localhost:9082',
        changeOrigin: true,
        secure: false,
      },
      // 3. Auction Service (MSA)
      '^/api/v1/(auctions|orders|bids|cart)': {
        target: 'http://localhost:9081',
        changeOrigin: true,
        secure: false,
      },
      // 4. Main Backend API (fourtune-api) - Catch all remaining APIs
      '/api': {
        target: 'http://localhost:9080',
        changeOrigin: true,
        secure: false,
      },
      // WebSocket Proxy
      '/ws': {
        target: 'http://localhost:9080',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
