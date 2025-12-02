const fs = require('fs')
const path = require('path')

exports.default = async function beforeBuild (context) {
  console.log('  + scripts/electron-builder-before-build.js')

  // Skip node_modules removal for Windows builds (cross-compilation from macOS)
  // The afterPack hook will handle downloading the correct ffmpeg binary
  if (context.platform.name === 'windows') {
    console.log(`      • Windows cross-compilation: skipping node_modules removal`)
    console.log(`      • ffmpeg.exe will be downloaded in afterPack hook`)
    return true
  }

  let pathToNodeModules = path.join(__dirname, '..', 'node_modules')

  if (fs.existsSync(pathToNodeModules)) {
    console.log(`      • removing node_modules to force ffmpeg-static to re-install for correct architecture`)
    fs.rmSync(pathToNodeModules, { recursive: true })
  }

  return true
}
