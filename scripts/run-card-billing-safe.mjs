import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const source = path.resolve('scripts/patch-card-billing.mjs')
const temp = path.resolve('scripts/.patch-card-billing-fixed.mjs')
let code = fs.readFileSync(source, 'utf8')

// Corrige duas incompatibilidades do patch original antes de executá-lo:
// 1) JSX com aspas duplas dentro de uma string JS delimitada por aspas duplas.
// 2) O guia inicial não possui mais placeholder="0,00" no campo de limite,
//    então o padrão antigo não encontrava a segunda ocorrência e abortava o build.
code = code.replace('className="fx-inline-hint"', "className='fx-inline-hint'")
code = code.replaceAll(' placeholder=\\"0,00\\"', '')

fs.writeFileSync(temp, code)
try {
  await import(`${pathToFileURL(temp).href}?v=${Date.now()}`)
} finally {
  try { fs.unlinkSync(temp) } catch {}
}
