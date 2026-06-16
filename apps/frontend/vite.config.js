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
 * 鲁棒的文件名解析：从文件名中提取歌手和歌名
 * 支持格式: "歌手 - 歌名", "歌手--歌名", "歌名 - 歌手", "歌手_歌名"
 */
function parseMusicFileName(fileName) {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "")
  
  // 优先级 1: 处理 " -- " 或 "--" (用户截图中出现的格式)
  if (nameWithoutExt.includes('--')) {
    const parts = nameWithoutExt.split('--')
    if (parts.length >= 2) {
      return { artist: parts[1].trim(), title: parts[0].trim() } // 适配 "歌名--歌手"
    }
  }

  // 优先级 2: 处理 " - "
  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ')
    return { artist: parts[0].trim(), title: parts[1].trim() }
  }

  // 优先级 3: 处理 "_" (如果不包含空格)
  if (nameWithoutExt.includes('_') && !nameWithoutExt.includes(' ')) {
    const parts = nameWithoutExt.split('_')
    return { artist: parts[0].trim(), title: parts[1].trim() }
  }

  return { artist: '未知歌手', title: nameWithoutExt }
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

          // Concurrency Control: Process 3 files at a time to avoid memory crash
          const results = []
          const batchSize = 3
          for (let i = 0; i < fileNames.length; i += batchSize) {
            const batch = fileNames.slice(i, i + batchSize)
            const batchResults = await Promise.all(batch.map(async f => {
              const filePath = path.resolve(scanPath, f)
              const fileNameWithoutExt = f.replace(/\.[^/.]+$/, "")

              try {
                const metadata = await mm.parseFile(filePath)
                let cover = null
                if (metadata.common.picture && metadata.common.picture.length > 0) {
                  const pic = metadata.common.picture[0]
                  cover = await compressCoverToDataURI(pic.data, pic.format)
                }
                
                // --- 核心修复：优先从文件名解析元数据以规避 ID3 乱码 ---
                const fileNameInfo = parseMusicFileName(f)
                
                // 1. 歌手：优先用文件名解析出的歌手 (如果不是未知)
                let artist = fileNameInfo.artist
                if (artist === '未知歌手') {
                  artist = fixEncoding(metadata.common.artist) || '未知歌手'
                }

                // 2. 歌名：优先用文件名解析出的歌名
                let title = fileNameInfo.title || fileNameWithoutExt

                // 3. 专辑：文件名通常不含专辑，仍从 ID3 读取并尝试修复编码
                let album = fixEncoding(metadata.common.album) || '未知专辑'

                return {
                  name: title,
                  artist: artist,
                  album: album,
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
            results.push(...batchResults)
          }

          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(results))
        })

        // --- 2. Upload Local Music ---
        server.middlewares.use('/api/upload', (req, res) => {
          if (req.method !== 'POST') return res.end('Only POST allowed')

          try {
            const busboy = Busboy({
              headers: req.headers,
              defParamCharset: 'utf8',
              limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
            })
            const uploadDir = path.resolve(__dirname, 'public/media/local')

            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

            busboy.on('file', (name, file, info) => {
              let { filename } = info

              try {
                const buffer = Buffer.from(filename, 'latin1')
                const decoded = buffer.toString('utf8')
                if (decoded !== filename && !decoded.includes('�')) {
                  filename = decoded
                }
              } catch (e) {}

              const saveTo = path.join(uploadDir, filename)
              const writeStream = fs.createWriteStream(saveTo)
              
              file.on('error', (err) => {
                console.error('[Uploader] File stream error:', err)
                writeStream.destroy()
              })

              writeStream.on('error', (err) => {
                console.error('[Uploader] Write stream error:', err)
                file.resume()
              })

              file.pipe(writeStream)

              // 关键修复：确保只有当文件真正写入完成后才继续处理下一个
              writeStream.on('finish', () => {
                console.log(`[Uploader] Saved: ${filename}`)
              })
            })

            busboy.on('finish', () => {
              // 给磁盘写入留出最后的缓冲时间，确保所有流都已关闭
              setTimeout(() => {
                if (!res.writableEnded) {
                  res.setHeader('Content-Type', 'application/json; charset=utf-8')
                  res.end(JSON.stringify({ success: true, message: 'Upload finished' }))
                }
              }, 200)
            })

            req.pipe(busboy)
          } catch (err) {
            console.error('[Uploader] Setup error:', err)
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
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
