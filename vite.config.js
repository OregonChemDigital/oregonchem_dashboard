import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
      strictRequires: true,
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: ['firebase/app', 'firebase/auth', 'firebase/analytics'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/analytics'],
          mui: ['@mui/material', '@emotion/react', '@emotion/styled']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/analytics']
  },
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
      VITE_APP_NAME: JSON.stringify(process.env.VITE_APP_NAME),
      VITE_APP_VERSION: JSON.stringify(process.env.VITE_APP_VERSION)
    }
  }
})
