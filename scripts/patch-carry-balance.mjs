import fs from 'node:fs'

const file='src/pages/Dashboard3.tsx'
let src=fs.readFileSync(file,'utf8')

if(src.includes('CARRY_BALANCE_V1')){
  console.log('Saldo acumulado entre meses já aplicado neste build.')
  process.exit(0)
}

function rep(from,to,label){
  if(!src.includes(from)){
    console.warn(`Patch saldo acumulado: não encontrei ${label}; seguindo sem interromper o build.`)
    return false
  }
  src=src.replace(from,()=>to)
  return true
}

// O saldo disponível não zera na virada do mês.
// Ele parte dos saldos iniciais das contas e soma apenas movimentos efetivamente pagos/recebidos
// até o mês selecionado. Valores pendentes continuam separados no cartão "Previstos".
const totalsNeedle="const totalAccountBalance=accountStats.reduce((n:number,a:any)=>n+a._balance,0),totalReceived=accountStats.reduce((n:number,a:any)=>n+a._received,0),totalSpent=accountStats.reduce((n:number,a:any)=>n+a._spent,0)"
const totalsReplacement=`${totalsNeedle}\n /* CARRY_BALANCE_V1 */\n const carriedBalance=useMemo(()=>{const opening=accounts.reduce((n:number,a:any)=>n+Number(a.opening_balance||0),0);const settled=moves.filter((x:any)=>x.status==='paid'&&effectiveMonth(x)<=selectedMonth).reduce((n:number,x:any)=>n+(x.type==='income'?valueInBrl(x):-valueInBrl(x)),0);return opening+settled},[accounts,moves,selectedMonth])`
rep(totalsNeedle,totalsReplacement,'totais das contas')

rep(
  '<Home income={income} expense={expense} balance={balance}',
  '<Home income={income} expense={expense} balance={carriedBalance}',
  'saldo enviado para a Home'
)

rep(
  '<Metric label="Saldo do mês" value={money(balance)}',
  '<Metric label="Saldo disponível" value={money(balance)}',
  'nome do cartão de saldo'
)

fs.writeFileSync(file,src)
console.log('Saldo não gasto agora continua nos meses seguintes; receitas e gastos continuam mensais.')
