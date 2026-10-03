import fs from 'node:fs'

const file='src/pages/Dashboard3.tsx'
const cssFile='src/dashboard3.css'
let src=fs.readFileSync(file,'utf8')
let css=fs.readFileSync(cssFile,'utf8')

if(src.includes('ACCOUNT_BALANCES_V1')){
  console.log('Saldos por banco e transferências já aplicados neste build.')
  process.exit(0)
}

function rep(from,to,label){
  if(!src.includes(from)) throw new Error(`Patch saldos: não encontrei ${label}`)
  src=src.replace(from,()=>to)
}

rep(
  "[selectedMonth,setSelectedMonth]=useState(currentMonth())",
  "[selectedMonth,setSelectedMonth]=useState(currentMonth()),[transferOpen,setTransferOpen]=useState(false),[transferForm,setTransferForm]=useState<any>({from_account_id:'',to_account_id:'',amount:'',occurred_on:today(),notes:''})",
  'estado de transferência'
)

rep(
  "const visibleMoves=useMemo(()=>moves.filter((x:any)=>effectiveMonth(x)===selectedMonth),[moves,selectedMonth])\n function open",
  `const visibleMoves=useMemo(()=>moves.filter((x:any)=>effectiveMonth(x)===selectedMonth),[moves,selectedMonth])
 /* ACCOUNT_BALANCES_V1 */
 const accountStats=useMemo(()=>accounts.map((a:any)=>{const rows=moves.filter((x:any)=>x.account_id===a.id&&x.status==='paid'&&x.status!=='cancelled');const received=rows.filter((x:any)=>x.type==='income'&&!x.is_transfer).reduce((n:number,x:any)=>n+valueInBrl(x),0);const spent=rows.filter((x:any)=>x.type==='expense'&&!x.is_transfer).reduce((n:number,x:any)=>n+valueInBrl(x),0);const transferIn=rows.filter((x:any)=>x.type==='income'&&x.is_transfer).reduce((n:number,x:any)=>n+valueInBrl(x),0);const transferOut=rows.filter((x:any)=>x.type==='expense'&&x.is_transfer).reduce((n:number,x:any)=>n+valueInBrl(x),0);const balance=Number(a.opening_balance||0)+received-spent+transferIn-transferOut;return {...a,_received:received,_spent:spent,_transferIn:transferIn,_transferOut:transferOut,_balance:balance}}),[accounts,moves])
 const totalAccountBalance=accountStats.reduce((n:number,a:any)=>n+a._balance,0),totalReceived=accountStats.reduce((n:number,a:any)=>n+a._received,0),totalSpent=accountStats.reduce((n:number,a:any)=>n+a._spent,0)
 function open`,
  'estatísticas por conta'
)

rep(
  " async function remove(table:string,id:string,before?:()=>Promise<any>){",
  ` async function saveTransfer(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const from=transferForm.from_account_id,to=transferForm.to_account_id,amount=Number(String(transferForm.amount||0).replace(',','.'));if(!from||!to)throw new Error('Selecione a conta de origem e a conta de destino.');if(from===to)throw new Error('A conta de origem e de destino precisam ser diferentes.');if(!(amount>0))throw new Error('Informe um valor maior que zero.');const source=accountStats.find((a:any)=>a.id===from);if(source&&amount>source._balance)throw new Error('O valor da transferência é maior que o saldo disponível na conta de origem.');const group=crypto.randomUUID();const date=transferForm.occurred_on||today();const fromName=accounts.find((a:any)=>a.id===from)?.name||'Conta';const toName=accounts.find((a:any)=>a.id===to)?.name||'Conta';const rows=[{user_id:uid,type:'expense',description:\`Transferência para \${toName}\`,amount,occurred_on:date,status:'paid',payment_method:'Transferência entre contas',account_id:from,is_transfer:true,transfer_group_id:group,notes:transferForm.notes||null,currency_code:'BRL',exchange_rate_to_brl:1},{user_id:uid,type:'income',description:\`Transferência de \${fromName}\`,amount,occurred_on:date,status:'paid',payment_method:'Transferência entre contas',account_id:to,is_transfer:true,transfer_group_id:group,notes:transferForm.notes||null,currency_code:'BRL',exchange_rate_to_brl:1}];const r=await supabase.from('transactions').insert(rows);if(r.error)throw r.error;setTransferOpen(false);setTransferForm({from_account_id:'',to_account_id:'',amount:'',occurred_on:today(),notes:''});await load()}catch(err:any){setError(err?.message||'Não foi possível transferir.')}finally{setBusy(false)}}
 async function remove(table:string,id:string,before?:()=>Promise<any>){`,
  'função de transferência'
)

const oldAccounts = "{view==='accounts'&&<LogoList rows={accounts} fallback=\"🏦\" line={(x:any)=>`${x.institution_name||'Instituição'} · ${x.pix_key?'Pix cadastrado':'sem Pix'}`} amount={(x:any)=>`Saldo inicial ${money(x.opening_balance)}`} edit={(x:any)=>open('account',x)} del={(id:string)=>remove('accounts',id)}/>}"
const newAccounts = "{view==='accounts'&&<AccountsPage rows={accountStats} totalBalance={totalAccountBalance} totalReceived={totalReceived} totalSpent={totalSpent} edit={(x:any)=>open('account',x)} del={(id:string)=>remove('accounts',id)} transfer={(from?:string)=>{setTransferForm({from_account_id:from||'',to_account_id:'',amount:'',occurred_on:today(),notes:''});setTransferOpen(true)}}/>}"
rep(oldAccounts,newAccounts,'tela de contas')

rep(
  "{modal&&<Editor kind={modal} form={form} setF={setF} editing={editing} accounts={accounts} cards={cards} categories={categories} error={error} busy={busy} close={()=>setModal(null)} save={save}/>}</main>",
  "{modal&&<Editor kind={modal} form={form} setF={setF} editing={editing} accounts={accounts} cards={cards} categories={categories} error={error} busy={busy} close={()=>setModal(null)} save={save}/>} {transferOpen&&<TransferModal form={transferForm} setForm={setTransferForm} accounts={accountStats} busy={busy} error={error} close={()=>setTransferOpen(false)} save={saveTransfer}/>}</main>",
  'modal de transferência'
)

const anchor='function LogoList({rows,fallback,line,amount,edit,del}:any)'
const components=`function AccountsPage({rows,totalBalance,totalReceived,totalSpent,edit,del,transfer}:any){return <><div className="fx-summary fx-account-summary"><Metric label="Saldo total nas contas" value={money(totalBalance)} tone={totalBalance>=0?'positive':'negative'}/><Metric label="Total recebido" value={money(totalReceived)} tone="positive"/><Metric label="Total gasto" value={money(totalSpent)} tone="negative"/><article className="fx-metric fx-transfer-metric"><span>Entre suas contas</span><button type="button" onClick={()=>transfer()}><Repeat2/>Transferir saldo</button><i/></article></div><div className="fx-cards-list">{rows.length?rows.map((x:any)=><article className="fx-entity fx-bank-account" key={x.id}><Avatar url={x.logo_url} label={x.name} fallback="🏦" size="lg"/><div className="fx-bank-main"><h3>{x.name}</h3><p>{x.institution_name||'Instituição'} · {x.pix_key?'Pix cadastrado':'sem Pix'}</p><strong className="fx-bank-balance">{money(x._balance)}</strong><small>Saldo atual · inicial {money(x.opening_balance)}</small><div className="fx-bank-flow"><span className="good">+ {money(x._received)} recebidos</span><span className="bad">- {money(x._spent)} gastos</span>{(x._transferIn>0||x._transferOut>0)&&<span>↔ {money(x._transferIn)} entrou / {money(x._transferOut)} saiu</span>}</div><button type="button" className="fx-transfer-button" onClick={()=>transfer(x.id)}><Repeat2/>Transferir desta conta</button></div><Actions edit={()=>edit(x)} del={()=>del(x.id)}/></article>):<Empty text="Nenhuma conta cadastrada"/>}</div></>}
function TransferModal({form,setForm,accounts,busy,error,close,save}:any){const set=(k:string,v:any)=>setForm((f:any)=>({...f,[k]:v}));const source=accounts.find((a:any)=>a.id===form.from_account_id);return <div className="fx-backdrop" onMouseDown={close}><form className="fx-modal fx-transfer-modal" onSubmit={save} onMouseDown={e=>e.stopPropagation()}><button type="button" className="fx-close" onClick={close}><X/></button><div className="fx-modal-title"><span><Repeat2/></span><div><small>MOVER DINHEIRO</small><h2>Transferir entre contas</h2></div></div><p className="fx-transfer-help">Isso não conta como receita nem como gasto. O valor sai de uma conta e entra na outra.</p><Grid><F l="Sai de"><select required value={form.from_account_id||''} onChange={e=>set('from_account_id',e.target.value)}><option value="">Selecione</option>{accounts.map((a:any)=><option key={a.id} value={a.id}>{a.name} · saldo {money(a._balance)}</option>)}</select></F><F l="Vai para"><select required value={form.to_account_id||''} onChange={e=>set('to_account_id',e.target.value)}><option value="">Selecione</option>{accounts.filter((a:any)=>a.id!==form.from_account_id).map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}</select></F><F l="Valor"><input required inputMode="decimal" value={form.amount||''} onChange={e=>set('amount',e.target.value)} placeholder="0,00"/></F><F l="Data"><input type="date" required value={form.occurred_on||today()} onChange={e=>set('occurred_on',e.target.value)}/></F></Grid>{source&&<div className="fx-transfer-preview"><span>Saldo disponível</span><b>{money(source._balance)}</b>{Number(String(form.amount||0).replace(',','.'))>0&&<strong>Depois: {money(source._balance-Number(String(form.amount||0).replace(',','.')))}</strong>}</div>}<F l="Observação"><textarea value={form.notes||''} onChange={e=>set('notes',e.target.value)} placeholder="Opcional"/></F><button className="fx-primary full" disabled={busy}>{busy?'Transferindo…':'Confirmar transferência'}</button>{error&&<div className="fx-error">{error}</div>}</form></div>}
`
rep(anchor,components+anchor,'componentes de contas e transferência')

const cssExtra=`
/* saldos bancários e transferências */
.fx-account-summary{align-items:stretch}.fx-transfer-metric button{margin-top:8px;display:inline-flex;align-items:center;gap:7px;border:1px solid #34513f;background:#102219;color:#78e89c;border-radius:11px;padding:8px 11px;font-weight:800;cursor:pointer}.fx-transfer-metric button svg,.fx-transfer-button svg{width:15px;height:15px}.fx-bank-account{align-items:flex-start}.fx-bank-main{min-width:0;flex:1}.fx-bank-balance{display:block;font-size:24px;margin-top:6px;color:#eef9f2}.fx-bank-main>small{display:block;color:#72897a;margin-top:2px}.fx-bank-flow{display:flex;gap:8px 14px;flex-wrap:wrap;margin-top:10px;font-size:11px;color:#8fa296}.fx-bank-flow .good{color:#6be58f}.fx-bank-flow .bad{color:#ff8b8b}.fx-transfer-button{margin-top:12px;display:inline-flex;align-items:center;gap:7px;border:1px solid #31513d;background:#0e2016;color:#75e69a;border-radius:11px;padding:8px 10px;font-weight:800;cursor:pointer}.fx-transfer-help{margin:-2px 0 14px;color:#8da093;line-height:1.45}.fx-transfer-preview{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 14px;padding:12px 13px;border:1px solid #274431;background:#0d1d14;border-radius:14px}.fx-transfer-preview span{color:#83988a}.fx-transfer-preview b{color:#eef8f1}.fx-transfer-preview strong{margin-left:auto;color:#72e497}@media(max-width:620px){.fx-bank-balance{font-size:21px}.fx-transfer-preview strong{width:100%;margin-left:0}.fx-account-summary{grid-template-columns:1fr 1fr}}
`
if(!css.includes('/* saldos bancários e transferências */')) css+=cssExtra

fs.writeFileSync(file,src)
fs.writeFileSync(cssFile,css)
console.log('Saldos totais, resumo por banco e transferências entre contas adicionados.')
