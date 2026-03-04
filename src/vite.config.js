import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  base: './',
  build: {
    // Defines the output directory for the production build
    outDir: 'dist', 
    
    // Generates source maps to help debugging the production code if needed
    sourcemap: true, 
    
    // Configures how assets like CSS and Images are organized
    assetsDir: 'assets', 
    
    // Ensures the dist folder is emptied before a new build is created
    emptyOutDir: true, 

    rollupOptions: {
      output: {
        // This ensures your JS and CSS files have predictable or organized names
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
})
