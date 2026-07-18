import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { rmSync, existsSync, mkdirSync, copyFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Version resolution logic ---
let TARGET_MAJOR_VERSION = null;

// --- Adapters only ---
const adapters = [
  { name: "node-http-adapter", url: "https://github.com/stone-foundation/stone-js-node-http-adapter" },
  { name: "aws-lambda-http-adapter", url: "https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter" },
  { name: "aws-lambda-adapter", url: "https://github.com/stone-foundation/stone-js-aws-lambda-adapter" },
  { name: "browser-adapter", url: "https://github.com/stone-foundation/stone-js-browser-adapter" },
  { name: "node-cli-adapter", url: "https://github.com/stone-foundation/stone-js-node-cli-adapter" }
];

try {
  const envVersion = process.env.STONE_DOCS_VERSION;
  if (envVersion && /^v?\d+/.test(envVersion)) {
    TARGET_MAJOR_VERSION = parseInt(envVersion.replace(/^v/, '').split('.')[0], 10);
    console.log(`📦 Using version from environment: v${TARGET_MAJOR_VERSION}.x.x`);
  }

  if (!TARGET_MAJOR_VERSION) {
    const latestTag = execSync('git tag --sort=-v:refname').toString().split('\n').find(Boolean);
    if (latestTag && /^v\d+\.\d+\.\d+$/.test(latestTag)) {
      TARGET_MAJOR_VERSION = parseInt(latestTag.replace(/^v/, '').split('.')[0], 10);
      console.log(`📦 Using version from latest docs tag: ${latestTag}`);
    }
  }
} catch (e) {
  console.warn('⚠️ Could not resolve version from git tag:', e.message);
}

if (!TARGET_MAJOR_VERSION) {
  TARGET_MAJOR_VERSION = 0;
  console.warn(`⚠️ Falling back to default version: v${TARGET_MAJOR_VERSION}.x.x`);
}

console.log(`\n🔌 Fetching adapter READMEs for: v${TARGET_MAJOR_VERSION}.x.x\n`);

const TMP_DIR = path.join(__dirname, '../tmp-adapter-clone');
const DEST_ROOT = path.join(__dirname, '../src/packages');

// Ensure destination root exists
mkdirSync(DEST_ROOT, { recursive: true });

for (const adapter of adapters) {
  const repoPath = path.join(TMP_DIR, adapter.name);
  const destPath = path.join(DEST_ROOT, adapter.name, 'readme.md');

  console.log(`➡️ Processing ${adapter.name}...`);

  try {
    // Shallow bare clone to get tags
    execSync(`git clone --quiet --bare ${adapter.url} ${repoPath}`);

    const tagsRaw = execSync(`git --git-dir=${repoPath} tag --sort=-v:refname`).toString();
    const tags = tagsRaw
      .split('\n')
      .filter(tag => new RegExp(`^v${TARGET_MAJOR_VERSION}\\.\\d+\\.\\d+$`).test(tag));

    if (tags.length === 0) {
      console.warn(`⚠️ No matching v${TARGET_MAJOR_VERSION}.x.x tag found in ${adapter.name}, skipping.`);
      continue;
    }

    const latestTag = tags[0];
    console.log(`✅ Found: ${latestTag}`);

    // Clone that tag to temp
    const clonePath = path.join(TMP_DIR, `${adapter.name}-checkout`);
    execSync(`git clone --depth 1 --branch ${latestTag} ${adapter.url} ${clonePath}`);

    const readmePath = path.join(clonePath, 'README.md');
    if (existsSync(readmePath)) {
      console.log(`📄 Copying README.md...`);
      mkdirSync(path.dirname(destPath), { recursive: true });
      copyFileSync(readmePath, destPath);
    } else {
      console.warn(`⚠️ No README.md found in ${adapter.name}@${latestTag}, skipping.`);
    }

    // Cleanup
    rmSync(clonePath, { recursive: true, force: true });
    rmSync(repoPath, { recursive: true, force: true });

  } catch (err) {
    console.error(`❌ Error processing ${adapter.name}: ${err.message}`);
  }
}

rmSync(TMP_DIR, { recursive: true, force: true });

console.log(`\n✅ All adapter READMEs synced for v${TARGET_MAJOR_VERSION}.x.x\n`);
