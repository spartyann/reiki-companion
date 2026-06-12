const { execSync } = require('child_process')
const path = require('path')

const root = path.join(__dirname, '..')
const src = path.join(root, 'src', 'assets', 'imgs', 'logo.png')

const androidSizes = [
  { folder: 'mipmap-mdpi',    size: 48  },
  { folder: 'mipmap-hdpi',    size: 72  },
  { folder: 'mipmap-xhdpi',   size: 96  },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
]

const androidBase = path.join(root, 'android', 'app', 'src', 'main', 'res')

function ps(script) {
  execSync(`powershell -Command "${script.replace(/"/g, '\\"')}"`, { stdio: 'inherit' })
}

function resizePng(from, to, size) {
  ps(`
    Add-Type -AssemblyName System.Drawing;
    $src = New-Object System.Drawing.Bitmap('${from.replace(/\\/g, '\\\\')}');
    $dst = New-Object System.Drawing.Bitmap(${size}, ${size});
    $g = [System.Drawing.Graphics]::FromImage($dst);
    $g.DrawImage($src, 0, 0, ${size}, ${size});
    $g.Dispose();
    $dst.Save('${to.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Png);
    $src.Dispose(); $dst.Dispose();
  `)
}

// --- Android : génère tous les mipmap ---
console.log('Generating Android icons...')
for (const { folder, size } of androidSizes) {
  const dest = path.join(androidBase, folder, 'ic_launcher.png')
  const destRound = path.join(androidBase, folder, 'ic_launcher_round.png')
  resizePng(src, dest, size)
  resizePng(src, destRound, size)
  console.log(`  → ${folder} (${size}x${size})`)
}

console.log('Done.')
