import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const source = path.resolve('scripts/patch-card-billing.mjs')
const temp = path.resolve('scripts/.patch-card-billing-fixed.mjs')
let code = fs.readFileSync(source, 'utf8')

// O patch original contém JSX dentro de uma string JS delimitada por aspas duplas.
// Esta ocorrência específica precisa usar aspas simples para que o próprio patch seja JavaScript válido.
code = code.replace('className="fx-inline-hint"', "className='fx-inline-hint'")

fs.writeFileSync(temp, code)
try {
  await import(`${pathToFileURL(temp).href}?v=${Date.now()}`)
} finally {
  try { fs.unlinkSync(temp) } catch {}
}
