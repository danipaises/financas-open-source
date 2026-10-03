import fs from 'node:fs'

const file='src/pages/Dashboard3.tsx'
const cssFile='src/dashboard3.css'
let src=fs.readFileSync(file,'utf8')
let css=fs.readFileSync(cssFile,'utf8')

if(src.includes("const currencyOptions=[")){
  console.log('Suporte internacional já aplicado neste build.')
  process.exit(0)
}

function rep(from,to,label){
  if(!src.includes(from)) throw new Error(`Patch internacional: não encontrei ${label}`)
  src=src.replace(from,()=>to)
}

rep(
"const freqs=[['weekly','Semanal'],['monthly','Mensal'],['quarterly','Trimestral'],['semiannual','Semestral'],['annual','Anual']]",
`const freqs=[['weekly','Semanal'],['monthly','Mensal'],['quarterly','Trimestral'],['semiannual','Semestral'],['annual','Anual']]
const currencyOptions=[
 {code:'BRL',name:'Real brasileiro',symbol:'R$'},{code:'USD',name:'Dólar americano',symbol:'US$'},{code:'EUR',name:'Euro',symbol:'€'},{code:'GBP',name:'Libra esterlina',symbol:'£'},
 {code:'JPY',name:'Iene japonês',symbol:'¥'},{code:'CAD',name:'Dólar canadense',symbol:'C$'},{code:'AUD',name:'Dólar australiano',symbol:'A$'},{code:'CHF',name:'Franco suíço',symbol:'CHF'},
 {code:'CNY',name:'Yuan chinês',symbol:'¥'},{code:'ARS',name:'Peso argentino',symbol:'AR$'},{code:'MXN',name:'Peso mexicano',symbol:'MX$'},{code:'CLP',name:'Peso chileno',symbol:'CLP$'}
]
const incomePresets:Preset[]=[{name:'Salário',emoji:'💼'},{name:'Presente',emoji:'🎁'},{name:'Freelance',emoji:'🧑‍💻'},{name:'Venda',emoji:'🏷️'},{name:'Reembolso',emoji:'↩️'},{name:'Investimentos',emoji:'📈'},{name:'Benefício',emoji:'🪙'},{name:'Outras receitas',emoji:'💰'}]
const formatCurrency=(value:any,code='BRL')=>{try{return new Intl.NumberFormat('pt-BR',{style:'currency',currency:code}).format(Number(value||0))}catch{return \`\${code} \${Number(value||0).toFixed(2)}\`}}
const rateToBrl=(row:any)=>String(row?.currency_code||'BRL').toUpperCase()==='BRL'?1:Number(row?.exchange_rate_to_brl||1)
const valueInBrl=(row:any)=>Number(row?.amount||0)*rateToBrl(row)
const totalInBrl=(row:any)=>Number(row?.total_amount||0)*rateToBrl(row)`,
'constante de moedas')

rep(
"const monthMoves=useMemo(()=>moves.filter(x=>String(x.occurred_on).startsWith(currentMonth())&&x.status!=='cancelled'),[moves]),income=monthMoves.filter(x=>x.type==='income').reduce((n,x)=>n+Number(x.amount),0),expense=monthMoves.filter(x=>x.type==='expense').reduce((n,x)=>n+Number(x.amount),0),balance=income-expense",
"const monthMoves=useMemo(()=>moves.filter(x=>String(x.occurred_on).startsWith(currentMonth())&&x.status!=='cancelled'),[moves]),income=monthMoves.filter(x=>x.type==='income').reduce((n,x)=>n+valueInBrl(x),0),expense=monthMoves.filter(x=>x.type==='expense').reduce((n,x)=>n+valueInBrl(x),0),balance=income-expense",
'resumo mensal')
rep("m[k]=(m[k]||0)+Number(x.amount)","m[k]=(m[k]||0)+valueInBrl(x)",'análise por categoria')

rep("if(kind==='move')setForm(item||{type:'expense',description:'',amount:'',occurred_on:today(),status:'paid',payment_method:'Pix',category_id:'',account_id:'',card_id:'',logo_url:'',notes:''});","if(kind==='move')setForm(item||{type:'expense',description:'',amount:'',occurred_on:today(),status:'paid',payment_method:'Pix',category_id:'',account_id:'',card_id:'',currency_code:'BRL',exchange_rate_to_brl:'1',logo_url:'',notes:''});",'formulário de lançamento')
rep("if(kind==='subscription')setForm(item||{name:'',amount:'',frequency:'monthly',next_charge_date:today(),status:'active',account_id:'',card_id:'',category_id:'',management_url:'',logo_url:'',notes:''});","if(kind==='subscription')setForm(item||{name:'',amount:'',frequency:'monthly',next_charge_date:today(),status:'active',account_id:'',card_id:'',category_id:'',management_url:'',currency_code:'BRL',exchange_rate_to_brl:'1',logo_url:'',notes:''});",'formulário de assinatura')
rep("if(kind==='installment')setForm({description:'',merchant:'',total_amount:'',installments_count:'2',first_due_date:today(),card_id:'',account_id:'',category_id:'',logo_url:'',notes:''});","if(kind==='installment')setForm({description:'',merchant:'',total_amount:'',installments_count:'2',first_due_date:today(),card_id:'',account_id:'',category_id:'',currency_code:'BRL',exchange_rate_to_brl:'1',logo_url:'',notes:''});",'formulário de parcelamento')

rep("amount:Number(String(form.amount).replace(',','.')),occurred_on:","amount:Number(String(form.amount).replace(',','.')),currency_code:form.currency_code||'BRL',exchange_rate_to_brl:(form.currency_code||'BRL')==='BRL'?1:Number(String(form.exchange_rate_to_brl||1).replace(',','.')),occurred_on:",'moeda do lançamento')
rep("amount:Number(String(form.amount).replace(',','.')),frequency:form.frequency", "amount:Number(String(form.amount).replace(',','.')),currency_code:form.currency_code||'BRL',exchange_rate_to_brl:(form.currency_code||'BRL')==='BRL'?1:Number(String(form.exchange_rate_to_brl||1).replace(',','.')),frequency:form.frequency",'moeda da assinatura')
rep("total_amount:total,installments_count:count", "total_amount:total,currency_code:form.currency_code||'BRL',exchange_rate_to_brl:(form.currency_code||'BRL')==='BRL'?1:Number(String(form.exchange_rate_to_brl||1).replace(',','.')),installments_count:count",'moeda do parcelamento')
rep("description:`${form.description} — ${i+1}/${count}`,amount,occurred_on:", "description:`${form.description} — ${i+1}/${count}`,amount,currency_code:form.currency_code||'BRL',exchange_rate_to_brl:(form.currency_code||'BRL')==='BRL'?1:Number(String(form.exchange_rate_to_brl||1).replace(',','.')),occurred_on:",'moeda das parcelas')

src=src.replaceAll('money(x.amount)',"formatCurrency(x.amount,x.currency_code||'BRL')")
src=src.replaceAll('money(x.total_amount)',"formatCurrency(x.total_amount,x.currency_code||'BRL')")
src=src.replaceAll("amount:x.amount,date:x.next_charge_date,logo_url:x.logo_url", "amount:x.amount,currency_code:x.currency_code,date:x.next_charge_date,logo_url:x.logo_url")
src=src.replaceAll("amount:x.amount,logo_url:x.logo_url,type:'expense'", "amount:x.amount,currency_code:x.currency_code,logo_url:x.logo_url,type:'expense'")

rep("<LogoPicker title=\"Ícone / logo do lançamento\" presets={merchantPresets}","<CurrencyFields form={form} setF={setF}/><LogoPicker title={form.type==='income'?'Ícone da receita':'Ícone / logo da despesa'} presets={form.type==='income'?incomePresets:merchantPresets}",'ícones de receita/despesa')
rep("<LogoPicker title=\"Logo da assinatura\" presets={subscriptionPresets}","<CurrencyFields form={form} setF={setF}/><LogoPicker title=\"Logo da assinatura\" presets={subscriptionPresets}",'moeda da assinatura no editor')
rep("<LogoPicker title=\"Logo da compra\" presets={merchantPresets}","<CurrencyFields form={form} setF={setF} amountKey=\"total_amount\"/><LogoPicker title=\"Logo da compra\" presets={merchantPresets}",'moeda do parcelamento no editor')

const logoPickerStart="function LogoPicker({title,presets,value,onChange,onName}:any)"
const currencyComponent=`function CurrencyFields({form,setF,amountKey='amount'}:any){
 const code=form.currency_code||'BRL',foreign=code!=='BRL',rate=Number(String(form.exchange_rate_to_brl||1).replace(',','.')),original=Number(String(form[amountKey]||0).replace(',','.')),approx=foreign&&rate>0?original*rate:original
 return <div className="fx-currency-box"><div className="fx-currency-head"><div><b>Moeda</b><span>{foreign?'Compra internacional':'Valor em reais'}</span></div>{foreign&&original>0&&rate>0&&<strong>≈ {money(approx)}</strong>}</div><div className="fx-currency-fields"><F l="Moeda"><select value={code} onChange={e=>{const c=e.target.value;setF('currency_code',c);if(c==='BRL')setF('exchange_rate_to_brl','1')}}>{currencyOptions.map(c=><option key={c.code} value={c.code}>{c.symbol} · {c.name} ({c.code})</option>)}</select></F>{foreign&&<F l="Cotação para real (1 unidade = R$)"><input required inputMode="decimal" value={form.exchange_rate_to_brl||''} onChange={e=>setF('exchange_rate_to_brl',e.target.value)} placeholder="Ex.: 5,45"/></F>}</div>{foreign&&<small>A cotação fica salva junto com a compra para seu histórico e análises continuarem corretos.</small>}</div>
}
`
if(!src.includes(logoPickerStart)) throw new Error('Patch internacional: LogoPicker não encontrado')
src=src.replace(logoPickerStart,()=>currencyComponent+logoPickerStart)

const cssExtra=`\n/* moedas internacionais */\n.fx-currency-box{margin:15px 0;padding:15px;border:1px solid #254333;background:linear-gradient(145deg,#0d1c15,#09140f);border-radius:18px}.fx-currency-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}.fx-currency-head>div{display:grid;gap:2px}.fx-currency-head b{font-size:13px;color:#eaf7ef}.fx-currency-head span,.fx-currency-box>small{font-size:11px;color:#80958a}.fx-currency-head strong{font-size:13px;color:#6ee294}.fx-currency-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fx-currency-box .fx-field{margin:5px 0}@media(max-width:620px){.fx-currency-fields{grid-template-columns:1fr}.fx-currency-head{align-items:flex-start;flex-direction:column}}\n`
if(!css.includes('/* moedas internacionais */')) css+=cssExtra

fs.writeFileSync(file,src)
fs.writeFileSync(cssFile,css)
console.log('Compras internacionais e ícones de receita adicionados ao build com substituição segura.')
