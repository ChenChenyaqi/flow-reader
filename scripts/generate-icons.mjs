#!/usr/bin/env node
/**
 * Generate icon sizes from fluent-read.png
 * Run with: node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOURCE_ICON = path.resolve(__dirname, '../src/assets/fluent-read.png')
const OUTPUT_DIR = path.resolve(__dirname, '../public')

// Icon sizes required by Chrome/Edge Web Store
const SIZES = [16, 48, 96, 128]

async function generateIcons() {
  console.log('🎨 Generating icons from fluent-read.png...')

  // Ensure public directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log('✅ Created public/ directory')
  }

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error('❌ Source icon not found:', SOURCE_ICON)
    process.exit(1)
  }

  // Generate each size
  for (const size of SIZES) {
    const outputFile = path.join(OUTPUT_DIR, `icon-${size}.png`)

    await sharp(SOURCE_ICON)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .png()
      .toFile(outputFile)

    console.log(`✅ Generated icon-${size}.png (${size}x${size})`)
  }

  console.log('\n🎉 All icons generated successfully!')
  console.log(`📁 Output directory: ${OUTPUT_DIR}`)
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err)
  process.exit(1)
})
