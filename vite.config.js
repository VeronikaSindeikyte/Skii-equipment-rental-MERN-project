import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:4001',
//         changeOrigin: true,
//         secure: false,
//       }
//     }
//   }
// });

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production'
          ? 'https://skii-equipment-rental-mern-project.onrender.com'
          : 'http://localhost:4001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'process.env.API_BASE_URL': JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? 'https://skii-equipment-rental-mern-project.onrender.com'
        : 'http://localhost:4001'
    ),
  },
});