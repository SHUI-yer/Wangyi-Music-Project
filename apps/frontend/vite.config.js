import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import * as mm from 'music-metadata'
import Busboy from 'busboy'
import iconv from 'iconv-lite'
import jschardet from 'jschardet'

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

          const fileNames = fs.readdirSync(scanPath).filter(f => /\.(mp3|wav|ogg)$/i.test(f))
          
          const files = await Promise.all(fileNames.map(async f => {
            const filePath = path.resolve(scanPath, f)
            const fileNameWithoutExt = f.replace(/\.[^/.]+$/, "")
            
            try {
              const metadata = await mm.parseFile(filePath)
              let cover = null
              if (metadata.common.picture && metadata.common.picture.length > 0) {
                const pic = metadata.common.picture[0]
                cover = `data:${pic.format};base64,${pic.data.toString('base64')}`
              }
              
              // Logic Requirement: 
              // 1. Title (name) always from FileName
              // 2. Artist & Album from ID3 with encoding fix
              // 3. Cover from ID3 if exists
              
              return {
                name: fileNameWithoutExt,
                artist: fixEncoding(metadata.common.artist) || '未知歌手',
                album: fixEncoding(metadata.common.album) || '未知专辑',
                duration: metadata.format.duration ? 
                  `${Math.floor(metadata.format.duration / 60)}:${Math.floor(metadata.format.duration % 60).toString().padStart(2, '0')}` : 
                  '03:30',
                cover: cover || 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+album+cover+placeholder&image_size=square',
                url: `${baseUrl}/${f}`,
                fileName: f
              }
            } catch (err) {
              return {
                name: fileNameWithoutExt,
                artist: '未知歌手',
                album: '未知专辑',
                cover: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+album+cover+placeholder&image_size=square',
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
