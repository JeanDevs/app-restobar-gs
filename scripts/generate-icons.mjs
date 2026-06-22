// Genera los PNG de la PWA a partir de public/icon.svg (Golden Hour).
// Uso: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svg = readFileSync(resolve(root, 'public/icon.svg'))

const targets = [
  { file: 'public/pwa-192x192.png', size: 192 },
  { file: 'public/pwa-512x512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
]

// Ícono "maskable": el arte se reduce al 80% sobre fondo chocolate (safe zone).
async function maskable() {
  const size = 512
  const inner = Math.round(size * 0.8)
  const art = await sharp(svg).resize(inner, inner).png().toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: '#3a322e' },
  })
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toFile(resolve(root, 'public/maskable-512x512.png'))
  console.log('✓ public/maskable-512x512.png')
}

for (const t of targets) {
  await sharp(svg).resize(t.size, t.size).png().toFile(resolve(root, t.file))
  console.log('✓', t.file)
}
await maskable()
console.log('Done.')
