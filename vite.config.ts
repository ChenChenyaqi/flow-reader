import path from 'path'
import fs from 'fs'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import manifest from './src/manifest.json'
import AdmZip from 'adm-zip'

// Plugin to copy icons to dist
function copyIcons() {
  return {
    name: 'copy-icons',
    writeBundle() {
      const publicDir = path.resolve(__dirname, 'public')
      const distDir = path.resolve(__dirname, 'dist')

      // Icon files to copy
      const icons = ['icon-16.png', 'icon-48.png', 'icon-96.png', 'icon-128.png']

      icons.forEach(icon => {
        const src = path.join(publicDir, icon)
        const dest = path.join(distDir, icon)

        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest)
          console.log(`✅ Copied ${icon} to dist/`)
        }
      })

      // Copy _locales directory
      const copyLocales = (srcDir: string, destDir: string) => {
        if (!fs.existsSync(srcDir)) return

        const entries = fs.readdirSync(srcDir, { withFileTypes: true })

        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }

        for (const entry of entries) {
          const srcPath = path.join(srcDir, entry.name)
          const destPath = path.join(destDir, entry.name)

          if (entry.isDirectory()) {
            copyLocales(srcPath, destPath)
          } else {
            fs.copyFileSync(srcPath, destPath)
          }
        }
      }

      const localesSrc = path.join(publicDir, '_locales')
      const localesDest = path.join(distDir, '_locales')

      copyLocales(localesSrc, localesDest)
      console.log(`✅ Copied _locales/ to dist/`)
    },
  }
}

// Plugin to create zip file after build
function createZip() {
  return {
    name: 'create-zip',
    writeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const zip = new AdmZip()

      // Directories to exclude from zip
      const excludeDirs = ['.vite', '__MACOSX']

      // Add all files from dist to zip
      const addFiles = (dir: string, baseDir = dir) => {
        const files = fs.readdirSync(dir)
        files.forEach(file => {
          // Skip excluded directories
          if (excludeDirs.includes(file)) {
            return
          }

          const filePath = path.join(dir, file)
          const stat = fs.statSync(filePath)

          if (stat.isDirectory()) {
            addFiles(filePath, baseDir)
          } else {
            const relativePath = path.relative(baseDir, filePath)
            zip.addLocalFile(filePath, path.dirname(relativePath))
          }
        })
      }

      addFiles(distDir)

      // Get version from package.json
      const packageJson = require('./package.json')
      const zipFileName = `fluent-read-v${packageJson.version}.zip`
      const zipPath = path.resolve(__dirname, zipFileName)

      zip.writeZip(zipPath)

      // Get file size
      const stats = fs.statSync(zipPath)
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)

      console.log(`\n📦 Created ${zipFileName} (${sizeMB} MB)`)
    },
  }
}

export default defineConfig({

  plugins: [vue(), crx({ manifest }), tailwindcss(), copyIcons(), createZip()],
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    watch: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
