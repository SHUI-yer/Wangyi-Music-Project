// vite.config.js
import { defineConfig } from "file:///C:/%E5%AE%9E%E8%AE%AD%E7%BD%91%E6%98%93%E4%BA%91%E9%A1%B9%E7%9B%AE/Wangyi-Music-Project/apps/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/%E5%AE%9E%E8%AE%AD%E7%BD%91%E6%98%93%E4%BA%91%E9%A1%B9%E7%9B%AE/Wangyi-Music-Project/apps/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import fs from "fs";
import * as mm from "file:///C:/%E5%AE%9E%E8%AE%AD%E7%BD%91%E6%98%93%E4%BA%91%E9%A1%B9%E7%9B%AE/Wangyi-Music-Project/apps/frontend/node_modules/music-metadata/lib/index.js";
import Busboy from "file:///C:/%E5%AE%9E%E8%AE%AD%E7%BD%91%E6%98%93%E4%BA%91%E9%A1%B9%E7%9B%AE/Wangyi-Music-Project/apps/frontend/node_modules/busboy/lib/index.js";
import iconv from "file:///C:/%E5%AE%9E%E8%AE%AD%E7%BD%91%E6%98%93%E4%BA%91%E9%A1%B9%E7%9B%AE/Wangyi-Music-Project/apps/frontend/node_modules/iconv-lite/lib/index.js";
import jschardet from "file:///C:/%E5%AE%9E%E8%AE%AD%E7%BD%91%E6%98%93%E4%BA%91%E9%A1%B9%E7%9B%AE/Wangyi-Music-Project/apps/frontend/node_modules/jschardet/index.js";
var __vite_injected_original_dirname = "C:\\\u5B9E\u8BAD\u7F51\u6613\u4E91\u9879\u76EE\\Wangyi-Music-Project\\apps\\frontend";
function fixEncoding(val) {
  if (!val) return null;
  let str = Array.isArray(val) ? val.join(", ") : String(val);
  if (!str || typeof str !== "string") return str;
  if (/^[\x00-\x7F]*$/.test(str)) return str;
  try {
    const bufRaw = Buffer.from(str, "binary");
    const detected = jschardet.detect(bufRaw);
    if (detected.encoding === "ISO-8859-1" || detected.encoding === "windows-1252") {
      const utf8Buf = Buffer.from(str, "latin1");
      const utf8Str = utf8Buf.toString("utf8");
      if (!utf8Str.includes("\uFFFD") && /[\u4e00-\u9fa5]/.test(utf8Str)) return utf8Str;
      const gbkStr = iconv.decode(utf8Buf, "gbk");
      if (!gbkStr.includes("\uFFFD") && /[\u4e00-\u9fa5]/.test(gbkStr)) return gbkStr;
    }
    const gbkBuf = Buffer.from(str, "binary");
    const gbkFixed = iconv.decode(gbkBuf, "gbk");
    if (!gbkFixed.includes("\uFFFD") && /[\u4e00-\u9fa5]/.test(gbkFixed)) return gbkFixed;
  } catch (e) {
  }
  return str;
}
var vite_config_default = defineConfig({
  server: {
    port: 3e3,
    open: true,
    // Increase limit for large audio files
    headers: {
      "Connection": "keep-alive"
    }
  },
  plugins: [
    vue(),
    {
      name: "scan-media",
      configureServer(server) {
        server.middlewares.use("/api/scan-media", async (req, res) => {
          const url = new URL(req.url, "http://localhost");
          const category = url.searchParams.get("category") || "";
          const playlistId = url.searchParams.get("playlistId") || "";
          let scanPath = path.resolve(__vite_injected_original_dirname, "public/media");
          let baseUrl = "/media";
          if (category) {
            scanPath = path.resolve(scanPath, category);
            baseUrl = `/media/${category}`;
          } else if (playlistId) {
            scanPath = path.resolve(__vite_injected_original_dirname, "public/playlists", playlistId);
            baseUrl = `/playlists/${playlistId}`;
          }
          if (!fs.existsSync(scanPath)) {
            res.end(JSON.stringify([]));
            return;
          }
          const fileNames = fs.readdirSync(scanPath).filter((f) => /\.(mp3|wav|ogg)$/i.test(f));
          const files = await Promise.all(fileNames.map(async (f) => {
            const filePath = path.resolve(scanPath, f);
            const fileNameWithoutExt = f.replace(/\.[^/.]+$/, "");
            try {
              const metadata = await mm.parseFile(filePath);
              let cover = null;
              if (metadata.common.picture && metadata.common.picture.length > 0) {
                const pic = metadata.common.picture[0];
                cover = `data:${pic.format};base64,${pic.data.toString("base64")}`;
              }
              return {
                name: fileNameWithoutExt,
                artist: fixEncoding(metadata.common.artist) || "\u672A\u77E5\u6B4C\u624B",
                album: fixEncoding(metadata.common.album) || "\u672A\u77E5\u4E13\u8F91",
                duration: metadata.format.duration ? `${Math.floor(metadata.format.duration / 60)}:${Math.floor(metadata.format.duration % 60).toString().padStart(2, "0")}` : "03:30",
                cover: cover || "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+album+cover+placeholder&image_size=square",
                url: `${baseUrl}/${f}`,
                fileName: f
              };
            } catch (err) {
              return {
                name: fileNameWithoutExt,
                artist: "\u672A\u77E5\u6B4C\u624B",
                album: "\u672A\u77E5\u4E13\u8F91",
                cover: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=music+album+cover+placeholder&image_size=square",
                url: `${baseUrl}/${f}`,
                fileName: f
              };
            }
          }));
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(files));
        });
        server.middlewares.use("/api/upload", (req, res) => {
          if (req.method !== "POST") return res.end("Only POST allowed");
          const busboy = Busboy({
            headers: req.headers,
            defParamCharset: "utf8"
            // Ensure UTF-8 for form fields
          });
          const uploadDir = path.resolve(__vite_injected_original_dirname, "public/media/local");
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          busboy.on("file", (name, file, info) => {
            let { filename } = info;
            try {
              const buffer = Buffer.from(filename, "latin1");
              const decoded = buffer.toString("utf8");
              if (decoded !== filename && !decoded.includes("\uFFFD")) {
                filename = decoded;
              }
            } catch (e) {
            }
            const saveTo = path.join(uploadDir, filename);
            console.log(`[Uploader] Saving: ${filename}`);
            file.pipe(fs.createWriteStream(saveTo));
          });
          busboy.on("finish", () => {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ success: true, message: "Upload finished" }));
          });
          req.pipe(busboy);
        });
        server.middlewares.use("/api/delete-local", (req, res) => {
          const url = new URL(req.url, "http://localhost");
          const fileName = url.searchParams.get("fileName");
          if (!fileName) return res.end("No filename provided");
          const filePath = path.resolve(__vite_injected_original_dirname, "public/media/local", fileName);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.end(JSON.stringify({ success: true }));
          } else {
            res.end(JSON.stringify({ success: false, error: "File not found" }));
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxcdTVCOUVcdThCQURcdTdGNTFcdTY2MTNcdTRFOTFcdTk4NzlcdTc2RUVcXFxcV2FuZ3lpLU11c2ljLVByb2plY3RcXFxcYXBwc1xcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcXHU1QjlFXHU4QkFEXHU3RjUxXHU2NjEzXHU0RTkxXHU5ODc5XHU3NkVFXFxcXFdhbmd5aS1NdXNpYy1Qcm9qZWN0XFxcXGFwcHNcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6LyVFNSVBRSU5RSVFOCVBRSVBRCVFNyVCRCU5MSVFNiU5OCU5MyVFNCVCQSU5MSVFOSVBMSVCOSVFNyU5QiVBRS9XYW5neWktTXVzaWMtUHJvamVjdC9hcHBzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCBmcyBmcm9tICdmcydcclxuaW1wb3J0ICogYXMgbW0gZnJvbSAnbXVzaWMtbWV0YWRhdGEnXHJcbmltcG9ydCBCdXNib3kgZnJvbSAnYnVzYm95J1xyXG5pbXBvcnQgaWNvbnYgZnJvbSAnaWNvbnYtbGl0ZSdcclxuaW1wb3J0IGpzY2hhcmRldCBmcm9tICdqc2NoYXJkZXQnXHJcblxyXG5mdW5jdGlvbiBmaXhFbmNvZGluZyh2YWwpIHtcclxuICBpZiAoIXZhbCkgcmV0dXJuIG51bGxcclxuICBcclxuICAvLyBJZiBpdCdzIGFuIGFycmF5IChjb21tb24gaW4gbXVzaWMtbWV0YWRhdGEpLCB0YWtlIHRoZSBmaXJzdCBvbmUgb3Igam9pblxyXG4gIGxldCBzdHIgPSBBcnJheS5pc0FycmF5KHZhbCkgPyB2YWwuam9pbignLCAnKSA6IFN0cmluZyh2YWwpXHJcbiAgXHJcbiAgaWYgKCFzdHIgfHwgdHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHJldHVybiBzdHJcclxuICBcclxuICAvLyBIZXVyaXN0aWM6IElmIGl0J3MgcHVyZSBBU0NJSSwgaXQncyBmaW5lXHJcbiAgaWYgKC9eW1xceDAwLVxceDdGXSokLy50ZXN0KHN0cikpIHJldHVybiBzdHJcclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIDEuIENoZWNrIGlmIGl0J3MgYWxyZWFkeSB2YWxpZCBVVEYtOFxyXG4gICAgY29uc3QgYnVmUmF3ID0gQnVmZmVyLmZyb20oc3RyLCAnYmluYXJ5JylcclxuICAgIGNvbnN0IGRldGVjdGVkID0ganNjaGFyZGV0LmRldGVjdChidWZSYXcpXHJcbiAgICBcclxuICAgIC8vIDIuIElmIGl0J3MgbGlrZWx5IExhdGluMSBidXQgc2hvdWxkIGJlIFVURi04IG9yIEdCS1xyXG4gICAgaWYgKGRldGVjdGVkLmVuY29kaW5nID09PSAnSVNPLTg4NTktMScgfHwgZGV0ZWN0ZWQuZW5jb2RpbmcgPT09ICd3aW5kb3dzLTEyNTInKSB7XHJcbiAgICAgIGNvbnN0IHV0ZjhCdWYgPSBCdWZmZXIuZnJvbShzdHIsICdsYXRpbjEnKVxyXG4gICAgICBcclxuICAgICAgLy8gVHJ5IFVURi04IGZpcnN0XHJcbiAgICAgIGNvbnN0IHV0ZjhTdHIgPSB1dGY4QnVmLnRvU3RyaW5nKCd1dGY4JylcclxuICAgICAgaWYgKCF1dGY4U3RyLmluY2x1ZGVzKCdcdUZGRkQnKSAmJiAvW1xcdTRlMDAtXFx1OWZhNV0vLnRlc3QodXRmOFN0cikpIHJldHVybiB1dGY4U3RyXHJcbiAgICAgIFxyXG4gICAgICAvLyBUaGVuIHRyeSBHQktcclxuICAgICAgY29uc3QgZ2JrU3RyID0gaWNvbnYuZGVjb2RlKHV0ZjhCdWYsICdnYmsnKVxyXG4gICAgICBpZiAoIWdia1N0ci5pbmNsdWRlcygnXHVGRkZEJykgJiYgL1tcXHU0ZTAwLVxcdTlmYTVdLy50ZXN0KGdia1N0cikpIHJldHVybiBnYmtTdHJcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gMy4gVHJ5IGZvcmNlZCBHQksgaWYgaXQncyBub3QgdmFsaWQgVVRGLThcclxuICAgIGNvbnN0IGdia0J1ZiA9IEJ1ZmZlci5mcm9tKHN0ciwgJ2JpbmFyeScpXHJcbiAgICBjb25zdCBnYmtGaXhlZCA9IGljb252LmRlY29kZShnYmtCdWYsICdnYmsnKVxyXG4gICAgaWYgKCFnYmtGaXhlZC5pbmNsdWRlcygnXHVGRkZEJykgJiYgL1tcXHU0ZTAwLVxcdTlmYTVdLy50ZXN0KGdia0ZpeGVkKSkgcmV0dXJuIGdia0ZpeGVkXHJcblxyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIC8vIFNpbGVudCBmYWlsXHJcbiAgfVxyXG4gIFxyXG4gIHJldHVybiBzdHJcclxufVxyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBvcGVuOiB0cnVlLFxyXG4gICAgLy8gSW5jcmVhc2UgbGltaXQgZm9yIGxhcmdlIGF1ZGlvIGZpbGVzXHJcbiAgICBoZWFkZXJzOiB7XHJcbiAgICAgICdDb25uZWN0aW9uJzogJ2tlZXAtYWxpdmUnXHJcbiAgICB9XHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3NjYW4tbWVkaWEnLFxyXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgICAgLy8gLS0tIDEuIFNjYW4gTWVkaWEgd2l0aCBNZXRhZGF0YSAtLS1cclxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL3NjYW4tbWVkaWEnLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwocmVxLnVybCwgJ2h0dHA6Ly9sb2NhbGhvc3QnKVxyXG4gICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnY2F0ZWdvcnknKSB8fCAnJ1xyXG4gICAgICAgICAgY29uc3QgcGxheWxpc3RJZCA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdwbGF5bGlzdElkJykgfHwgJydcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgbGV0IHNjYW5QYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3B1YmxpYy9tZWRpYScpXHJcbiAgICAgICAgICBsZXQgYmFzZVVybCA9ICcvbWVkaWEnXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmIChjYXRlZ29yeSkge1xyXG4gICAgICAgICAgICBzY2FuUGF0aCA9IHBhdGgucmVzb2x2ZShzY2FuUGF0aCwgY2F0ZWdvcnkpXHJcbiAgICAgICAgICAgIGJhc2VVcmwgPSBgL21lZGlhLyR7Y2F0ZWdvcnl9YFxyXG4gICAgICAgICAgfSBlbHNlIGlmIChwbGF5bGlzdElkKSB7XHJcbiAgICAgICAgICAgIHNjYW5QYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3B1YmxpYy9wbGF5bGlzdHMnLCBwbGF5bGlzdElkKVxyXG4gICAgICAgICAgICBiYXNlVXJsID0gYC9wbGF5bGlzdHMvJHtwbGF5bGlzdElkfWBcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoc2NhblBhdGgpKSB7XHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoW10pKVxyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZXMgPSBmcy5yZWFkZGlyU3luYyhzY2FuUGF0aCkuZmlsdGVyKGYgPT4gL1xcLihtcDN8d2F2fG9nZykkL2kudGVzdChmKSlcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCBQcm9taXNlLmFsbChmaWxlTmFtZXMubWFwKGFzeW5jIGYgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShzY2FuUGF0aCwgZilcclxuICAgICAgICAgICAgY29uc3QgZmlsZU5hbWVXaXRob3V0RXh0ID0gZi5yZXBsYWNlKC9cXC5bXi8uXSskLywgXCJcIilcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBtbS5wYXJzZUZpbGUoZmlsZVBhdGgpXHJcbiAgICAgICAgICAgICAgbGV0IGNvdmVyID0gbnVsbFxyXG4gICAgICAgICAgICAgIGlmIChtZXRhZGF0YS5jb21tb24ucGljdHVyZSAmJiBtZXRhZGF0YS5jb21tb24ucGljdHVyZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwaWMgPSBtZXRhZGF0YS5jb21tb24ucGljdHVyZVswXVxyXG4gICAgICAgICAgICAgICAgY292ZXIgPSBgZGF0YToke3BpYy5mb3JtYXR9O2Jhc2U2NCwke3BpYy5kYXRhLnRvU3RyaW5nKCdiYXNlNjQnKX1gXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIC8vIExvZ2ljIFJlcXVpcmVtZW50OiBcclxuICAgICAgICAgICAgICAvLyAxLiBUaXRsZSAobmFtZSkgYWx3YXlzIGZyb20gRmlsZU5hbWVcclxuICAgICAgICAgICAgICAvLyAyLiBBcnRpc3QgJiBBbGJ1bSBmcm9tIElEMyB3aXRoIGVuY29kaW5nIGZpeFxyXG4gICAgICAgICAgICAgIC8vIDMuIENvdmVyIGZyb20gSUQzIGlmIGV4aXN0c1xyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWxlTmFtZVdpdGhvdXRFeHQsXHJcbiAgICAgICAgICAgICAgICBhcnRpc3Q6IGZpeEVuY29kaW5nKG1ldGFkYXRhLmNvbW1vbi5hcnRpc3QpIHx8ICdcdTY3MkFcdTc3RTVcdTZCNENcdTYyNEInLFxyXG4gICAgICAgICAgICAgICAgYWxidW06IGZpeEVuY29kaW5nKG1ldGFkYXRhLmNvbW1vbi5hbGJ1bSkgfHwgJ1x1NjcyQVx1NzdFNVx1NEUxM1x1OEY5MScsXHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogbWV0YWRhdGEuZm9ybWF0LmR1cmF0aW9uID8gXHJcbiAgICAgICAgICAgICAgICAgIGAke01hdGguZmxvb3IobWV0YWRhdGEuZm9ybWF0LmR1cmF0aW9uIC8gNjApfToke01hdGguZmxvb3IobWV0YWRhdGEuZm9ybWF0LmR1cmF0aW9uICUgNjApLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKX1gIDogXHJcbiAgICAgICAgICAgICAgICAgICcwMzozMCcsXHJcbiAgICAgICAgICAgICAgICBjb3ZlcjogY292ZXIgfHwgJ2h0dHBzOi8vY29yZXNnLW5vcm1hbC50cmFlLmFpL2FwaS9pZGUvdjEvdGV4dF90b19pbWFnZT9wcm9tcHQ9bXVzaWMrYWxidW0rY292ZXIrcGxhY2Vob2xkZXImaW1hZ2Vfc2l6ZT1zcXVhcmUnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiBgJHtiYXNlVXJsfS8ke2Z9YCxcclxuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBmXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZU5hbWVXaXRob3V0RXh0LFxyXG4gICAgICAgICAgICAgICAgYXJ0aXN0OiAnXHU2NzJBXHU3N0U1XHU2QjRDXHU2MjRCJyxcclxuICAgICAgICAgICAgICAgIGFsYnVtOiAnXHU2NzJBXHU3N0U1XHU0RTEzXHU4RjkxJyxcclxuICAgICAgICAgICAgICAgIGNvdmVyOiAnaHR0cHM6Ly9jb3Jlc2ctbm9ybWFsLnRyYWUuYWkvYXBpL2lkZS92MS90ZXh0X3RvX2ltYWdlP3Byb21wdD1tdXNpYythbGJ1bStjb3ZlcitwbGFjZWhvbGRlciZpbWFnZV9zaXplPXNxdWFyZScsXHJcbiAgICAgICAgICAgICAgICB1cmw6IGAke2Jhc2VVcmx9LyR7Zn1gLFxyXG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGZcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JylcclxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoZmlsZXMpKVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIC0tLSAyLiBVcGxvYWQgTG9jYWwgTXVzaWMgLS0tXHJcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS91cGxvYWQnLCAocmVxLCByZXMpID0+IHtcclxuICAgICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHJldHVybiByZXMuZW5kKCdPbmx5IFBPU1QgYWxsb3dlZCcpXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGNvbnN0IGJ1c2JveSA9IEJ1c2JveSh7IFxyXG4gICAgICAgICAgICBoZWFkZXJzOiByZXEuaGVhZGVycyxcclxuICAgICAgICAgICAgZGVmUGFyYW1DaGFyc2V0OiAndXRmOCcgLy8gRW5zdXJlIFVURi04IGZvciBmb3JtIGZpZWxkc1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIGNvbnN0IHVwbG9hZERpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMvbWVkaWEvbG9jYWwnKVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmModXBsb2FkRGlyKSkgZnMubWtkaXJTeW5jKHVwbG9hZERpciwgeyByZWN1cnNpdmU6IHRydWUgfSlcclxuXHJcbiAgICAgICAgICBidXNib3kub24oJ2ZpbGUnLCAobmFtZSwgZmlsZSwgaW5mbykgPT4ge1xyXG4gICAgICAgICAgICBsZXQgeyBmaWxlbmFtZSB9ID0gaW5mb1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gRml4OiBJZiBmaWxlbmFtZSBpcyB3cm9uZ2x5IGludGVycHJldGVkIGFzIExhdGluMSwgY29udmVydCBiYWNrIHRvIFVURi04XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gQnVmZmVyLmZyb20oZmlsZW5hbWUsICdsYXRpbjEnKVxyXG4gICAgICAgICAgICAgIGNvbnN0IGRlY29kZWQgPSBidWZmZXIudG9TdHJpbmcoJ3V0ZjgnKVxyXG4gICAgICAgICAgICAgIC8vIENoZWNrIGlmIGl0IGxvb2tzIGxpa2UgdmFsaWQgVVRGLTggKGNvbW1vbiBoZXVyaXN0aWMpXHJcbiAgICAgICAgICAgICAgaWYgKGRlY29kZWQgIT09IGZpbGVuYW1lICYmICFkZWNvZGVkLmluY2x1ZGVzKCdcdUZGRkQnKSkge1xyXG4gICAgICAgICAgICAgICAgZmlsZW5hbWUgPSBkZWNvZGVkXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgLy8gRmFsbGJhY2sgdG8gb3JpZ2luYWxcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2F2ZVRvID0gcGF0aC5qb2luKHVwbG9hZERpciwgZmlsZW5hbWUpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbVXBsb2FkZXJdIFNhdmluZzogJHtmaWxlbmFtZX1gKVxyXG4gICAgICAgICAgICBmaWxlLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oc2F2ZVRvKSlcclxuICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgYnVzYm95Lm9uKCdmaW5pc2gnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JylcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdVcGxvYWQgZmluaXNoZWQnIH0pKVxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICByZXEucGlwZShidXNib3kpXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLy8gLS0tIDMuIERlbGV0ZSBMb2NhbCBNdXNpYyAtLS1cclxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL2RlbGV0ZS1sb2NhbCcsIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsLCAnaHR0cDovL2xvY2FsaG9zdCcpXHJcbiAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdmaWxlTmFtZScpXHJcbiAgICAgICAgICBpZiAoIWZpbGVOYW1lKSByZXR1cm4gcmVzLmVuZCgnTm8gZmlsZW5hbWUgcHJvdmlkZWQnKVxyXG5cclxuICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3B1YmxpYy9tZWRpYS9sb2NhbCcsIGZpbGVOYW1lKVxyXG4gICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XHJcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmMoZmlsZVBhdGgpXHJcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiB0cnVlIH0pKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ZpbGUgbm90IGZvdW5kJyB9KSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxyXG4gICAgfSxcclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlgsU0FBUyxvQkFBb0I7QUFDeFosT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFFBQVE7QUFDZixZQUFZLFFBQVE7QUFDcEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sV0FBVztBQUNsQixPQUFPLGVBQWU7QUFQdEIsSUFBTSxtQ0FBbUM7QUFTekMsU0FBUyxZQUFZLEtBQUs7QUFDeEIsTUFBSSxDQUFDLElBQUssUUFBTztBQUdqQixNQUFJLE1BQU0sTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLE9BQU8sR0FBRztBQUUxRCxNQUFJLENBQUMsT0FBTyxPQUFPLFFBQVEsU0FBVSxRQUFPO0FBRzVDLE1BQUksaUJBQWlCLEtBQUssR0FBRyxFQUFHLFFBQU87QUFFdkMsTUFBSTtBQUVGLFVBQU0sU0FBUyxPQUFPLEtBQUssS0FBSyxRQUFRO0FBQ3hDLFVBQU0sV0FBVyxVQUFVLE9BQU8sTUFBTTtBQUd4QyxRQUFJLFNBQVMsYUFBYSxnQkFBZ0IsU0FBUyxhQUFhLGdCQUFnQjtBQUM5RSxZQUFNLFVBQVUsT0FBTyxLQUFLLEtBQUssUUFBUTtBQUd6QyxZQUFNLFVBQVUsUUFBUSxTQUFTLE1BQU07QUFDdkMsVUFBSSxDQUFDLFFBQVEsU0FBUyxRQUFHLEtBQUssa0JBQWtCLEtBQUssT0FBTyxFQUFHLFFBQU87QUFHdEUsWUFBTSxTQUFTLE1BQU0sT0FBTyxTQUFTLEtBQUs7QUFDMUMsVUFBSSxDQUFDLE9BQU8sU0FBUyxRQUFHLEtBQUssa0JBQWtCLEtBQUssTUFBTSxFQUFH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
