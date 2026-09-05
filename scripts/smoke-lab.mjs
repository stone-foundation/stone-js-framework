/**
 * Builds real applications with the packages under test, then reads back what they serve.
 *
 * Every other gate in this repository stops at the package boundary. `test:ci` runs each package's
 * own suite against mocks and fixtures, `test:lab` runs the lab applications' unit tests, and
 * `build:ci` explicitly excludes `@stone-js/lab-*`. So nothing here ever ran `stone build` on an
 * application, and nothing ever asked a built application for a page.
 *
 * That gap has a price, and it has been paid: a server-rendered page shipped with the literal
 * `<!--env-js-->` marker in place of the public environment script, on both the SSR and the SSG
 * paths, for as long as the marker existed. Every unit test passed throughout. The defect lived in
 * the one step no test covered — the built application answering a request.
 *
 * So this walks the whole way: build the application from its own sources with the workspace's
 * packages, boot it when it has a server, fetch a page, and assert on what a browser would receive.
 * The applications are the lab ones because they are workspace members resolved through
 * `workspace:*` — a starter installs from the registry, so building one would test what is already
 * published rather than what this change does.
 */
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The applications, and what each one is expected to answer.
 *
 * `rendered` says the markup must already be in the document: an SSG page and an SSR response carry
 * the application, a CSR page carries an empty root the browser fills. `env` says the application
 * has a `.env.public`, so its public environment script must be linked — the assertion the marker
 * defect would have failed.
 */
const APPS = [
  {
    pkg: '@stone-js/lab-spa',
    dir: 'stone-js-lab/apps/spa',
    kind: 'static',
    env: true,
    pages: ['index.html'],
    rendered: false
  },
  {
    pkg: '@stone-js/lab-ssg',
    dir: 'stone-js-lab/apps/ssg',
    kind: 'static',
    env: true,
    pages: ['index.html', 'about/index.html'],
    rendered: true
  },
  {
    pkg: '@stone-js/lab-ssr',
    dir: 'stone-js-lab/apps/ssr',
    kind: 'server',
    env: true,
    routes: [{ path: '/', html: true, rendered: true }]
  },
  {
    pkg: '@stone-js/lab-rest-api',
    dir: 'stone-js-lab/apps/rest-api',
    kind: 'server',
    env: false,
    routes: [{ path: '/tasks', json: true, contains: '"title"' }]
  }
]

const failures = []

/** Records a check, and its outcome, on one line. */
function check (label, ok, detail = '') {
  console.log(`    ${ok ? '✔' : '✖'} ${label}${ok || detail === '' ? '' : ` — ${detail}`}`)
  if (!ok) { failures.push(label) }
}

/** A port nothing is listening on, asked of the kernel rather than guessed. */
async function freePort () {
  return await new Promise((resolve, reject) => {
    const server = net.createServer()
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
  })
}

/** Builds one application the way its own `build` script does. */
function build (app) {
  fs.rmSync(path.join(root, app.dir, 'dist'), { recursive: true, force: true })
  fs.rmSync(path.join(root, app.dir, '.stone'), { recursive: true, force: true })

  const result = spawnSync('pnpm', ['--filter', app.pkg, 'run', 'build'], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  })

  if (result.status === 0) { return true }

  // The build log is the whole diagnosis when this fails, and a run nobody can read is not a gate.
  console.log(result.stdout ?? '')
  console.error(result.stderr ?? '')
  check('builds', false, `exit ${String(result.status)}`)

  return false
}

/** Asserts on one document, whether it came off disk or off the wire. */
function assertDocument (where, html, app, expectRendered) {
  check(`${where}: no build marker survives`, !html.includes('<!--env-js-->'))

  if (app.env) {
    check(`${where}: links the public environment script`, html.includes('/env/environments.js'))
  }

  // The root's first child being an element is the whole assertion: an unrendered document holds
  // `<div id="root"><!--app-html--></div>` and nothing else. The marker itself is re-appended after
  // the markup on purpose, so its presence says nothing either way.
  if (expectRendered) {
    check(`${where}: carries the rendered application`, /id="root">\s*<[a-zA-Z]/.test(html))
  }
}

/** Waits until the application answers, or until it is clear it never will. */
async function waitForServer (url, child) {
  const deadline = Date.now() + 60_000

  while (Date.now() < deadline) {
    if (child.exitCode !== null) { return false }

    try {
      await fetch(url, { signal: AbortSignal.timeout(2000) })
      return true
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }

  return false
}

/** Stops the application, and does not take its word for it. */
async function stopServer (child) {
  if (child.exitCode !== null) { return }

  child.kill('SIGTERM')

  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 5000))
  ])

  if (child.exitCode === null) { child.kill('SIGKILL') }
}

/** Reads back the pages a build wrote to disk. */
function readStatic (app) {
  for (const page of app.pages) {
    const file = path.join(root, app.dir, 'dist', page)

    if (!fs.existsSync(file)) {
      check(`${page}: generated`, false, 'not found')
      continue
    }

    check(`${page}: generated`, true)
    assertDocument(page, fs.readFileSync(file, 'utf-8'), app, app.rendered)
  }
}

/** Boots the built application and asks it for its pages. */
async function serveAndRead (app) {
  const server = path.join(root, app.dir, 'dist', 'server.mjs')

  if (!fs.existsSync(server)) {
    check('server.mjs: generated', false, 'not found')
    return
  }

  check('server.mjs: generated', true)

  const port = await freePort()
  const output = []
  const child = spawn(process.execPath, [server], {
    cwd: path.join(root, app.dir),
    env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe']
  })

  child.stdout.on('data', (chunk) => output.push(String(chunk)))
  child.stderr.on('data', (chunk) => output.push(String(chunk)))

  try {
    const base = `http://127.0.0.1:${port}`

    if (!await waitForServer(base, child)) {
      console.error(output.join(''))
      check('answers on the port it was given', false, `exit ${String(child.exitCode)}`)
      return
    }

    check('answers on the port it was given', true)

    for (const route of app.routes) {
      const response = await fetch(`${base}${route.path}`, { signal: AbortSignal.timeout(10_000) })
      const body = await response.text()

      check(`GET ${route.path}: 200`, response.status === 200, `got ${response.status}`)

      if (route.html === true) { assertDocument(`GET ${route.path}`, body, app, route.rendered) }

      if (route.json === true) {
        check(`GET ${route.path}: answers ${route.contains}`, body.includes(route.contains), body.slice(0, 120))
      }
    }
  } finally {
    await stopServer(child)
  }
}

console.log(`smoke-lab: ${APPS.length} application(s) built and read back`)

for (const app of APPS) {
  console.log(`  ${app.pkg}`)

  if (!build(app)) { continue }

  check('builds', true)

  if (app.kind === 'static') { readStatic(app) } else { await serveAndRead(app) }
}

if (failures.length > 0) {
  console.error(`\n✖ ${failures.length} check(s) failed:`)
  failures.forEach((failure) => console.error(`  - ${failure}`))
  process.exit(1)
}

console.log('\n✔ every application built, and answered what it should')
