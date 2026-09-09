import process from 'node:process'
import { readFileSync } from 'node:fs'
import './require-pnpm.mjs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const expected = {
  pnpm: pkg.packageManager.replace('pnpm@', ''),
  react: pkg.dependencies.react,
  'react-dom': pkg.dependencies['react-dom'],
  vite: pkg.devDependencies.vite,
  '@vitejs/plugin-react': pkg.devDependencies['@vitejs/plugin-react'],
}

const results = await Promise.allSettled(Object.entries(expected).map(async ([name, pinned]) => {
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`, {
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`${name}: registro HTTP ${response.status}`)
  const latest = await response.json()
  if (!/^\d+\.\d+\.\d+$/.test(latest.version) || latest.deprecated) {
    throw new Error(`${name}: latest no es una version estable utilizable`)
  }
  if (pinned !== latest.version) {
    throw new Error(`${name}: fijada ${pinned}; ultima estable ${latest.version}. Actualizar y validar antes de continuar.`)
  }
  console.log(`${name}: ${pinned}, ultima estable confirmada`)
}))

for (const result of results) {
  if (result.status === 'rejected') {
    console.error(result.reason.message)
    process.exitCode = 1
  }
}
if (!process.exitCode) {
  console.log('Versiones verificadas. Ejecuta pnpm check:security y revisa los avisos oficiales; latest no garantiza seguridad.')
}
