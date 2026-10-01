import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const repo = path.resolve(__dirname, '../..')

export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@kit': path.join(repo, 'registry'),
      '@site': path.join(__dirname, 'src'),
      '@content': path.join(repo, 'content'),
      '@themes': path.join(repo, 'themes'),
    },
  },
  // The site reads blocks, themes and inspo from outside its own folder
  server: { fs: { allow: [repo] } },
  build: { outDir: path.join(repo, 'dist'), emptyOutDir: true },
})
