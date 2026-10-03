import fs from 'node:fs'

const file='src/pages/Dashboard3.tsx'
const cssFile='src/dashboard3.css'
let src=fs.readFileSync(file,'utf8')
let css=fs.readFileSync(cssFile,'utf8')

if(src.includes('Cotação automática mais recente')){
  console.log('Cotação automática já aplicada neste build.')
  process.exit(0)
}

const start=src.indexOf("function CurrencyFields({form,setF,amountKey='amount'}:any){")
const end=src.indexOf('\nfunction LogoPicker(',start)
if(start<0||end<0) throw new Error('CurrencyFields não encontrado. Execute patch-international antes.')

const replacement=`function CurrencyFields({form,setF,amountKey='amount'}:any){
 const code=form.currency_code||'BRL',foreign=code!=='BRL',rate=Number(String(form.exchange_rate_to_brl||1).replace(',','.')),original=Number(String(form[amountKey]||0).replace(',','.')),approx=foreign&&rate>0?original*rate:original
 const [rateLoading,setRateLoading]=useState(false),[rateError,setRateError]=useState(''),[rateDate,setRateDate]=useState('')
 async function refreshRate(force=false){
  if(!foreign){setF('exchange_rate_to_brl','1');setRateError('');setRateDate('');return}
  const key=\`financas-fx-\${code}-BRL\`
  try{
   if(!force){const cached=localStorage.getItem(key);if(cached){const parsed=JSON.parse(cached);if(Date.now()-Number(parsed.savedAt||0)<6*60*60*1000&&Number(parsed.rate)>0){setF('exchange_rate_to_brl',String(parsed.rate));setRateDate(parsed.date||'');return}}}
   setRateLoading(true);setRateError('')
   const response=await fetch(\`https://api.frankfurter.dev/v2/rate/\${code.toLowerCase()}/brl\`,{headers:{Accept:'application/json'}})
   if(!response.ok)throw new Error('Serviço de câmbio indisponível')
   const data=await response.json();const latest=Number(data?.rate)
   if(!Number.isFinite(latest)||latest<=0)throw new Error('Cotação inválida recebida')
   setF('exchange_rate_to_brl',String(latest));setRateDate(data?.date||'');localStorage.setItem(key,JSON.stringify({rate:latest,date:data?.date||'',savedAt:Date.now()}))
  }catch(err:any){setRateError('Não foi possível atualizar automaticamente. Você pode informar a cotação manualmente.')}
  finally{setRateLoading(false)}
 }
 useEffect(()=>{void refreshRate(false)},[code])
 return <div className="fx-currency-box"><div className="fx-currency-head"><div><b>Moeda</b><span>{foreign?'Compra internacional':'Valor em reais'}</span></div>{foreign&&original>0&&rate>0&&<strong>≈ {money(approx)}</strong>}</div><div className="fx-currency-fields"><F l="Moeda"><select value={code} onChange={e=>{const c=e.target.value;setF('currency_code',c);if(c==='BRL')setF('exchange_rate_to_brl','1')}}>{currencyOptions.map(c=><option key={c.code} value={c.code}>{c.symbol} · {c.name} ({c.code})</option>)}</select></F>{foreign&&<F l="Cotação automática mais recente (1 unidade = R$)"><div className="fx-rate-input"><input required inputMode="decimal" value={form.exchange_rate_to_brl||''} onChange={e=>setF('exchange_rate_to_brl',e.target.value)} placeholder="Buscando cotação…"/><button type="button" onClick={()=>void refreshRate(true)} disabled={rateLoading}>{rateLoading?'Atualizando…':'Atualizar'}</button></div></F>}</div>{foreign&&<div className="fx-rate-meta"><span>{rateLoading?'Buscando cotação automática…':rateDate?\`Cotação automática de \${new Date(rateDate+'T12:00:00').toLocaleDateString('pt-BR')} · fonte Frankfurter\`:'Cotação automática com edição manual disponível.'}</span>{rateError&&<small>{rateError}</small>}</div>}</div>
}`

src=src.slice(0,start)+replacement+src.slice(end)
const cssExtra=`\n/* cotação automática */\n.fx-rate-input{display:grid;grid-template-columns:1fr auto;gap:7px}.fx-rate-input button{border:1px solid #315440;background:#143220;color:#dff8e8;border-radius:11px;padding:0 12px;font-weight:800;cursor:pointer}.fx-rate-input button:disabled{opacity:.55;cursor:wait}.fx-rate-meta{margin-top:8px;display:grid;gap:4px}.fx-rate-meta span{font-size:11px;color:#7f9488}.fx-rate-meta small{font-size:11px;color:#ffaaa0}@media(max-width:620px){.fx-rate-input{grid-template-columns:1fr}.fx-rate-input button{min-height:40px}}\n`
if(!css.includes('/* cotação automática */'))css+=cssExtra
fs.writeFileSync(file,src)
fs.writeFileSync(cssFile,css)
console.log('Cotação automática adicionada ao build.')
