const fs = require('fs')
const path = require('path')
const https = require('https')
const { createGunzip } = require('zlib')
const { promisify } = require('util')
const { pipeline: pipelineCallback } = require('stream')
const pipeline = promisify(pipelineCallback)

// Download a file from URL to destination
function downloadFile(url, dest, decompress = false) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadFile(response.headers.location, dest, decompress).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`))
        return
      }

      const file = fs.createWriteStream(dest)

      if (decompress) {
        const gunzip = createGunzip()
        response.pipe(gunzip).pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
        file.on('error', (err) => {
          fs.unlinkSync(dest)
          reject(err)
        })
        gunzip.on('error', (err) => {
          fs.unlinkSync(dest)
          reject(err)
        })
      } else {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
        file.on('error', (err) => {
          fs.unlinkSync(dest)
          reject(err)
        })
      }
    }).on('error', reject)
  })
}

exports.default = async function afterPack(context) {
  console.log('  + scripts/electron-builder-after-pack.js')

  // For Windows builds, replace macOS ffmpeg with Windows ffmpeg.exe
  if (context.packager.platform.name === 'windows') {
    console.log(`      • Windows build: downloading Windows ffmpeg binary`)

    const appOutDir = context.appOutDir
    const ffmpegStaticPath = path.join(appOutDir, 'resources', 'app.asar.unpacked', 'node_modules', 'ffmpeg-static')

    // Remove macOS ffmpeg binary if it exists
    const macFfmpeg = path.join(ffmpegStaticPath, 'ffmpeg')
    if (fs.existsSync(macFfmpeg)) {
      console.log(`      • removing macOS ffmpeg binary from ${macFfmpeg}`)
      fs.unlinkSync(macFfmpeg)
    }

    // Download Windows ffmpeg binary
    const ffmpegPath = path.join(ffmpegStaticPath, 'ffmpeg.exe')
    const release = 'b4.4.1'
    const downloadUrl = `https://github.com/eugeneware/ffmpeg-static/releases/download/${release}/win32-x64.gz`

    console.log(`      • downloading ffmpeg from ${downloadUrl}`)
    console.log(`      • saving to ${ffmpegPath}`)

    try {
      // Download and decompress (third parameter = true for gzip decompression)
      await downloadFile(downloadUrl, ffmpegPath, true)
      console.log(`      • ffmpeg.exe downloaded and decompressed successfully (${fs.statSync(ffmpegPath).size} bytes)`)
    } catch (err) {
      console.error(`      • failed to download ffmpeg: ${err.message}`)
      throw err
    }
  }

  return true
}
