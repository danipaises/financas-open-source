import fs from 'node:fs'

const file='src/pages/Dashboard3.tsx'
let src=fs.readFileSync(file,'utf8')
const from="money(moves.filter((x:any)=>x.type==='expense'&&x.status==='pending').reduce((n:number,x:any)=>n+Number(x.amount),0))"
const to="money(moves.filter((x:any)=>x.type==='expense'&&x.status==='pending').reduce((n:number,x:any)=>n+valueInBrl(x),0))"
if(src.includes(from)){
  src=src.replace(from,to)
  fs.writeFileSync(file,src)
  console.log('Total previsto convertido para BRL corretamente.')
}else{
  console.log('Total previsto já corrigido ou estrutura alterada.')
}
