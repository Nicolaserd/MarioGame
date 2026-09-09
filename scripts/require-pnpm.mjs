import process from 'node:process'
import { readFileSync } from 'node:fs'

const { packageManager } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const expected = packageManager.replace('pnpm@', '')
const actual = process.env.npm_config_user_agent?.split(' ')[0]

if (actual !== `pnpm/${expected}`) {
  console.error(`Este proyecto requiere pnpm ${expected}. Usa pnpm install; no uses npm, npx, yarn ni bun.`)
  process.exit(1)
}
