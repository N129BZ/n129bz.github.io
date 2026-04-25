// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 1. Set the project root to 'src' (where index.html is located)
  root: 'src', 
  
  build: {
    // 2. Set the output directory (relative to the root)
    // If root is 'src', '../dist' puts the build in the project root
    outDir: '../dist',
    
    // Empty the output directory before building
    emptyOutDir: true,
  }
})