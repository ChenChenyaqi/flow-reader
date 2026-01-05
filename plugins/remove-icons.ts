import path from 'path'
import fs from 'fs'

export default function removeDistFiles(fileNames: string[]) {
  return {
    name: 'remove-dist-files',
    writeBundle() {
      const distDir = path.resolve(__dirname, '../dist')

      fileNames.forEach(fileName => {
        const filePath = path.join(distDir, fileName)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`🗑️  Removed ${fileName} from dist/`)
        }
      })
    },
  }
}
