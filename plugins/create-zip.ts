import path from 'path'
import fs from 'fs'
import packageJson from '../package.json'
import AdmZip from 'adm-zip'

export default function createZip() {
  return {
    name: 'create-zip',
    writeBundle() {
      const distDir = path.resolve(__dirname, '../dist')
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
      const zipFileName = `flow-reader-v${packageJson.version}.zip`
      const zipPath = path.resolve(__dirname, '..', zipFileName)

      zip.writeZip(zipPath)

      // Get file size
      const stats = fs.statSync(zipPath)
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)

      console.log(`\n📦 Created ${zipFileName} (${sizeMB} MB)`)
    },
  }
}
