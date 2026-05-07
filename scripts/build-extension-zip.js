/**
 * Build script: packages the Chrome extension into a downloadable ZIP.
 * Run at BUILD time (not serverless runtime) to ensure all files are included.
 *
 * Steps:
 * 1. Copy extension/ -> public/extension/ so Next.js serves static assets
 * 2. Replace __API_BASE_URL__ placeholder in content.js with env var
 * 3. Validate all required files exist and are non-empty
 * 4. Build sentinel-prime-extension.zip in public/downloads/
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const EXTENSION_DIR = path.join(PROJECT_ROOT, 'extension');
const PUBLIC_EXT_DIR = path.join(PROJECT_ROOT, 'public', 'extension');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'downloads');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'sentinel-prime-extension.zip');

const REQUIRED_FILES = [
  'manifest.json',
  'content.js',
  'content.css',
  'popup.html',
  'popup.js',
  'background.js',
];

const REQUIRED_ICONS = [
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function replaceApiPlaceholder(filePath) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '';
  if (!apiBaseUrl) {
    console.log('[build-extension-zip] No NEXT_PUBLIC_APP_URL env var found; keeping localhost fallback in content.js');
    return;
  }
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('__API_BASE_URL__')) {
    content = content.replace(/__API_BASE_URL__/g, apiBaseUrl);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[build-extension-zip] Replaced __API_BASE_URL__ with ${apiBaseUrl} in ${path.basename(filePath)}`);
  }
}

function validateExtension(dir) {
  let valid = true;
  for (const file of REQUIRED_FILES) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`MISSING required extension file: ${file}`);
      valid = false;
    } else {
      const stat = fs.statSync(filePath);
      if (stat.size === 0) {
        console.error(`EMPTY required extension file: ${file}`);
        valid = false;
      }
    }
  }
  for (const icon of REQUIRED_ICONS) {
    const iconPath = path.join(dir, icon);
    if (!fs.existsSync(iconPath)) {
      console.error(`MISSING required icon: ${icon}`);
      valid = false;
    } else {
      const stat = fs.statSync(iconPath);
      if (stat.size === 0) {
        console.error(`EMPTY icon file: ${icon}`);
        valid = false;
      }
    }
  }
  return valid;
}

async function buildZip() {
  // Step 1: Sync extension/ -> public/extension/
  ensureDir(PUBLIC_EXT_DIR);
  copyRecursive(EXTENSION_DIR, PUBLIC_EXT_DIR);
  console.log('[build-extension-zip] Synced extension/ -> public/extension/');

  // Step 2: Replace API placeholder in the public copy
  replaceApiPlaceholder(path.join(PUBLIC_EXT_DIR, 'content.js'));
  // Also replace in the source copy for unpacked development
  replaceApiPlaceholder(path.join(EXTENSION_DIR, 'content.js'));

  // Step 3: Validate
  if (!validateExtension(PUBLIC_EXT_DIR)) {
    console.error('Extension validation failed. Aborting ZIP build.');
    process.exit(1);
  }

  // Step 4: Build ZIP from public/extension/
  ensureDir(OUTPUT_DIR);
  const archive = archiver('zip', { zlib: { level: 9 } });
  const output = fs.createWriteStream(OUTPUT_FILE);

  await new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`Extension ZIP built: ${OUTPUT_FILE} (${archive.pointer()} bytes)`);
      resolve();
    });
    archive.on('error', reject);
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archiver warning:', err.message);
      } else {
        reject(err);
      }
    });

    archive.pipe(output);

    for (const file of REQUIRED_FILES) {
      archive.file(path.join(PUBLIC_EXT_DIR, file), { name: file });
    }

    archive.directory(path.join(PUBLIC_EXT_DIR, 'icons'), 'icons');
    archive.finalize();
  });
}

buildZip().catch((err) => {
  console.error('Failed to build extension ZIP:', err);
  process.exit(1);
});
