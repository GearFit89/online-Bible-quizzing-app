import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
 
    plugins: [ // Define plugins array
      react({ // Configure the React plugin
        babel: { // Configure Babel settings
          plugins: [ // Add Babel plugins
            ['babel-plugin-react-compiler', { target: '19' }] // Set target to React 19
          ], // End plugins array
        }, // End babel block
      }), // End react plugin
    ],// End plugins
  
  base:'./',
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
