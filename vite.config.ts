import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Esto le dice a Vite que '@' se refiere a la carpeta 'src'
    },
  },
  server: {
    host: '0.0.0.0',  // Hace que Vite escuche en todas las interfaces de red
    port: 5173,        // El puerto en el que Vite está corriendo
  }
});
