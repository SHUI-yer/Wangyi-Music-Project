import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import * as mm from 'music-metadata'
import Busboy from 'busboy'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'
import sharp from 'sharp'

function fixEncoding(val) {
  if (!val) return null

  // If it's an array (common in music-metadata), take the first one or join
  let str = Array.isArray(val) ? val.join(', ') : String(val)

  if (!str || typeof str !== 'string') return str

  // Heuristic: If it's pure ASCII, it's fine
  if (/^[\x00-\x7F]*$/.test(str)) return str

  try {
    // 1. Check if it's already valid UTF-8
    const bufRaw = Buffer.from(str, 'binary')
    const detected = jschardet.detect(bufRaw)

    // 2. If it's likely Latin1 but should be UTF-8 or GBK
    if (detected.encoding === 'ISO-8859-1' || detected.encoding === 'windows-1252') {
      const utf8Buf = Buffer.from(str, 'latin1')

      // Try UTF-8 first
      const utf8Str = utf8Buf.toString('utf8')
      if (!utf8Str.includes('�') && /[\u4e00-\u9fa5]/.test(utf8Str)) return utf8Str

      // Then try GBK
      const gbkStr = iconv.decode(utf8Buf, 'gbk')
      if (!gbkStr.includes('�') && /[\u4e00-\u9fa5]/.test(gbkStr)) return gbkStr
    }

    // 3. Try forced GBK if it's not valid UTF-8
    const gbkBuf = Buffer.from(str, 'binary')
    const gbkFixed = iconv.decode(gbkBuf, 'gbk')
    if (!gbkFixed.includes('�') && /[\u4e00-\u9fa5]/.test(gbkFixed)) return gbkFixed

  } catch (e) {
    // Silent fail
  }

  return str
}

// 本地默认封面占位图 (SVG data URI，不依赖外部网络)
const DEFAULT_COVER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="#e5e7eb" width="200" height="200"/><circle cx="100" cy="100" r="40" fill="#d1d5db"/><circle cx="100" cy="100" r="15" fill="#9ca3af"/><circle cx="100" cy="100" r="5" fill="#6b7280"/></svg>')}`

// 将封面图片压缩为低体积 JPG 并转 base64 data URI
// - 缩放至最大 300x300
// - 统一转为 JPEG 格式，quality=60
// - 输出 data:image/jpeg;base64,...
async function compressCoverToDataURI(picBuffer, picFormat) {
  try {
    const buf = Buffer.from(picBuffer)
    const compressed = await sharp(buf)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer()
    return `data:image/jpeg;base64,${compressed.toString('base64')}`
  } catch (err) {
    // sharp 压缩失败时，回退到原始 base64
    console.warn('Cover compression failed, using raw base64:', err.message)
    return `data:${picFormat};base64,${Buffer.from(picBuffer).toString('base64')}`
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    open: true,
    // Increase limit for large audio files
    headers: {
      'Connection': 'keep-alive'
    }
  },
  plugins: [
    vue(),
    {
      name: 'scan-media',
      configureServer(server) {
        // --- 1. Scan Media with Metadata ---
        server.middlewares.use('/api/scan-media', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const category = url.searchParams.get('category') || ''
          const playlistId = url.searchParams.get('playlistId') || ''

          let scanPath = path.resolve(__dirname, 'public/media')
          let baseUrl = '/media'

          if (category) {
            scanPath = path.resolve(scanPath, category)
            baseUrl = `/media/${category}`
          } else if (playlistId) {
            scanPath = path.resolve(__dirname, 'public/playlists', playlistId)
            baseUrl = `/playlists/${playlistId}`
          }

          if (!fs.existsSync(scanPath)) {
            res.end(JSON.stringify([]))
            return
          }

          const fileNames = fs.readdirSync(scanPath).filter(f => /\.(mp3|wav|ogg|flac)$/i.test(f))

          const files = await Promise.all(fileNames.map(async f => {
            const filePath = path.resolve(scanPath, f)
            const fileNameWithoutExt = f.replace(/\.[^/.]+$/, "")

            try {
              const metadata = await mm.parseFile(filePath)
              let cover = null
              if (metadata.common.picture && metadata.common.picture.length > 0) {
                const pic = metadata.common.picture[0]
                cover = await compressCoverToDataURI(pic.data, pic.format)
              }
              
              // Logic Requirement: 
              // 1. Title (name) always from FileName
              // 2. Artist & Album from ID3 with encoding fix
              // 3. Cover from ID3 if exists (compressed to JPEG)
              
              return {
                name: fileNameWithoutExt,
                artist: fixEncoding(metadata.common.artist) || '未知歌手',
                album: fixEncoding(metadata.common.album) || '未知专辑',
                duration: metadata.format.duration ? 
                  `${Math.floor(metadata.format.duration / 60)}:${Math.floor(metadata.format.duration % 60).toString().padStart(2, '0')}` : 
                  '03:30',
                cover: cover || DEFAULT_COVER,
                url: `${baseUrl}/${f}`,
                fileName: f
              }
            } catch (err) {
              return {
                name: fileNameWithoutExt,
                artist: '未知歌手',
                album: '未知专辑',
                cover: DEFAULT_COVER,
                url: `${baseUrl}/${f}`,
                fileName: f
              }
            }
          }))

          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(files))
        })

        // --- 2. Upload Local Music ---
        server.middlewares.use('/api/upload', (req, res) => {
          if (req.method !== 'POST') return res.end('Only POST allowed')

          const busboy = Busboy({
            headers: req.headers,
            defParamCharset: 'utf8' // Ensure UTF-8 for form fields
          })
          const uploadDir = path.resolve(__dirname, 'public/media/local')

          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

          busboy.on('file', (name, file, info) => {
            let { filename } = info

            // Fix: If filename is wrongly interpreted as Latin1, convert back to UTF-8
            try {
              const buffer = Buffer.from(filename, 'latin1')
              const decoded = buffer.toString('utf8')
              // Check if it looks like valid UTF-8 (common heuristic)
              if (decoded !== filename && !decoded.includes('�')) {
                filename = decoded
              }
            } catch (e) {
              // Fallback to original
            }

            const saveTo = path.join(uploadDir, filename)
            console.log(`[Uploader] Saving: ${filename}`)
            file.pipe(fs.createWriteStream(saveTo))
          })

          busboy.on('finish', () => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ success: true, message: 'Upload finished' }))
          })

          req.pipe(busboy)
        })

        // --- 3. Delete Local Music ---
        server.middlewares.use('/api/delete-local', (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const fileName = url.searchParams.get('fileName')
          if (!fileName) return res.end('No filename provided')

          const filePath = path.resolve(__dirname, 'public/media/local', fileName)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            res.end(JSON.stringify({ success: true }))
          } else {
            res.end(JSON.stringify({ success: false, error: 'File not found' }))
          }
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})
