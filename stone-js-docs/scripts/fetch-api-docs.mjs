import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { rmSync, existsSync, mkdirSync, cpSync } from 'fs';

// Use __dirname in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Resolve TARGET_MAJOR_VERSION ---
let TARGET_MAJOR_VERSION = null;

// --- 🔗 Repo list ---
const repositories = [
  { name: "core", url: "https://github.com/stone-foundation/stone-js-core" },
  { name: "pipeline", url: "https://github.com/stone-foundation/stone-js-pipeline" },
  { name: "service-container", url: "https://github.com/stone-foundation/stone-js-service-container" },
  { name: "config", url: "https://github.com/stone-foundation/stone-js-config" },
  { name: "env", url: "https://github.com/stone-foundation/stone-js-env" },
  { name: "filesystem", url: "https://github.com/stone-foundation/stone-js-filesystem" },
  { name: "http-core", url: "https://github.com/stone-foundation/stone-js-http-core" },
  { name: "browser-core", url: "https://github.com/stone-foundation/stone-js-browser-core" },
  { name: "node-http-adapter", url: "https://github.com/stone-foundation/stone-js-node-http-adapter" },
  { name: "aws-lambda-http-adapter", url: "https://github.com/stone-foundation/stone-js-aws-lambda-http-adapter" },
  { name: "aws-lambda-adapter", url: "https://github.com/stone-foundation/stone-js-aws-lambda-adapter" },
  { name: "browser-adapter", url: "https://github.com/stone-foundation/stone-js-browser-adapter" },
  { name: "node-cli-adapter", url: "https://github.com/stone-foundation/stone-js-node-cli-adapter" },
  { name: "router", url: "https://github.com/stone-foundation/stone-js-router" },
  { name: "use-react", url: "https://github.com/stone-foundation/stone-js-use-react" },
  { name: "cli", url: "https://github.com/stone-foundation/stone-js-cli" }
];

try {
  // 1. From ENV (set manually or by GitHub Actions)
  const envVersion = process.env.STONE_DOCS_VERSION;
  if (envVersion && /^v?\d+/.test(envVersion)) {
    TARGET_MAJOR_VERSION = parseInt(envVersion.replace(/^v/, '').split('.')[0], 10);
    console.log(`📦 Using version from environment: v${TARGET_MAJOR_VERSION}.x.x`);
  }

  // 2. If not, from latest Git tag in current docs repo
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

// 3. Fallback default
if (!TARGET_MAJOR_VERSION) {
  TARGET_MAJOR_VERSION = 0;
  console.warn(`⚠️ Falling back to default version: v${TARGET_MAJOR_VERSION}.x.x`);
}

const TMP_DIR = path.join(__dirname, '../tmp-clone');
const DEST_ROOT = path.join(__dirname, '../src/api');

console.log(`\n🔄 Fetching API docs for major version v${TARGET_MAJOR_VERSION}.x.x...`);

// Ensure destination root exists
mkdirSync(DEST_ROOT, { recursive: true });

// --- Main logic ---
for (const repo of repositories) {
  const repoPath = path.join(TMP_DIR, repo.name);
  const destPath = path.join(DEST_ROOT, repo.name);

  console.log(`➡️ Processing ${repo.name}...`);

  try {
    // Shallow bare clone for tag listing
    execSync(`git clone --quiet --bare ${repo.url} ${repoPath}`);

    // List and filter tags by major version
    const tagsRaw = execSync(`git --git-dir=${repoPath} tag --sort=-v:refname`).toString();
    const tags = tagsRaw
      .split('\n')
      .filter(tag => new RegExp(`^v${TARGET_MAJOR_VERSION}\\.\\d+\\.\\d+$`).test(tag));

    if (tags.length === 0) {
      console.warn(`⚠️ No matching v${TARGET_MAJOR_VERSION}.x.x tag found in ${repo.name}, skipping.`);
      continue;
    }

    const latestTag = tags[0];
    console.log(`✅ Found: ${latestTag}`);

    // Clone that tag
    const clonePath = path.join(TMP_DIR, `${repo.name}-checkout`);
    execSync(`git clone --depth 1 --branch ${latestTag} ${repo.url} ${clonePath}`);

    const docsPath = path.join(clonePath, 'docs');
    if (existsSync(docsPath)) {
      console.log(`📁 Copying docs...`);
      mkdirSync(destPath, { recursive: true });
      cpSync(docsPath, destPath, { recursive: true });
    } else {
      console.warn(`⚠️ No docs folder in ${repo.name}@${latestTag}, skipping.`);
    }

    // Clean up
    rmSync(clonePath, { recursive: true, force: true });
    rmSync(repoPath, { recursive: true, force: true });

  } catch (err) {
    console.error(`❌ Error processing ${repo.name}: ${err.message}`);
  }
}

rmSync(TMP_DIR, { recursive: true, force: true });

console.log(`\n✅ Done! All API documentation synced for v${TARGET_MAJOR_VERSION}.x.x\n`);
