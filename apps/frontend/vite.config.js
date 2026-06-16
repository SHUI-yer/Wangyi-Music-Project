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

  // If it's an array, take the first one
  let str = Array.isArray(val) ? val[0] : String(val)
  if (!str || typeof str !== 'string') return str

  // 1. 如果包含常见的乱码特征（如 '鉃' 或大量 '�'），尝试修复
  const hasGarbage = /[\u9243\ufffd]/.test(str)
  
  try {
    const bufRaw = Buffer.from(str, 'binary')
    
    // 尝试识别编码
    const detected = jschardet.detect(bufRaw)
    
    // 2. 针对 Windows 下常见的 GBK (ID3v1/v2 常见问题)
    if (detected.encoding === 'windows-1252' || detected.encoding === 'ISO-8859-1' || hasGarbage) {
      // 尝试用 GBK 解码
      const gbkStr = iconv.decode(bufRaw, 'gbk')
      // 如果解码后包含中文且没有乱码，则使用
      if (/[\u4e00-\u9fa5]/.test(gbkStr) && !gbkStr.includes('�')) {
        return gbkStr
      }
      
      // 尝试用 UTF-8 解码
      const utf8Str = bufRaw.toString('utf8')
      if (/[\u4e00-\u9fa5]/.test(utf8Str) && !utf8Str.includes('�')) {
        return utf8Str
      }
    }
  } catch (e) {
    // 忽略错误
  }

  // 3. 最后检查：如果字符串中还是包含乱码，返回 null 让前端走文件名解析兜底
  if (str.includes('�') || /[\u9243]/.test(str)) {
    return null
  }

  return str
}

/**
 * 从文件名解析歌手和歌名
 * 格式通常为: "歌手 - 歌名.mp3"
 */
function parseMusicFileName(fileName) {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "")
  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ')
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    }
  }
  return {
    artist: '未知歌手',
    title: nameWithoutExt
  }
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
              
              // 编码修复与兜底逻辑
              let artist = fixEncoding(metadata.common.artist)
              let album = fixEncoding(metadata.common.album)
              
              // 如果 ID3 标签修复后仍然失效（返回 null），则从文件名中解析
              if (!artist || artist === '未知歌手') {
                const parsed = parseMusicFileName(f)
                artist = parsed.artist
              }

              return {
                name: fileNameWithoutExt,
                artist: artist || '未知歌手',
                album: album || '未知专辑',
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
