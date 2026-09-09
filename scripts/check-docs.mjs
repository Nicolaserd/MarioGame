import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import './require-pnpm.mjs'

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', '*.md'], {
  cwd: root, encoding: 'utf8',
}).split('\0').filter(Boolean)
const reports = []
const errors = []
let links = 0

for (const file of new Set(files)) {
  const absolute = path.resolve(root, file)
  if (!existsSync(absolute)) continue // Archivos eliminados aun presentes en el indice Git.
  const text = readFileSync(absolute, 'utf8')
  const lines = text.trimEnd() ? text.trimEnd().split(/\r?\n/).length : 0
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0
  reports.push({ file, lines, words, bytes: Buffer.byteLength(text) })
  if (lines > 100 || words > 500) errors.push(`${file}: ${lines}/100 lineas, ${words}/500 palabras`)
  // Enlaces Markdown inline locales; no verifica URLs remotas ni anclas.
  for (const [, href] of text.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(href)) continue
    const destination = path.resolve(path.dirname(absolute), decodeURIComponent(href.split('#')[0]))
    if (!existsSync(destination)) errors.push(`${file}: enlace inexistente ${href}`)
    links++
  }
}

if (process.argv.includes('--verbose')) console.table(reports)
console.log(`${reports.length} Markdown; ${links} enlaces locales revisados.`)
console.log(`Maximos: ${Math.max(0, ...reports.map(r => r.lines))} lineas y ${Math.max(0, ...reports.map(r => r.words))} palabras por archivo.`)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log('Presupuesto documental y destinos locales correctos. Palabras y bytes no son tokens exactos.')
}
