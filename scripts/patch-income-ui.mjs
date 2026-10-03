import fs from 'node:fs'

const file='src/pages/Dashboard3.tsx'
let src=fs.readFileSync(file,'utf8')

if(src.includes('RECEITA_UI_V2')){
  console.log('Interface de receita já corrigida neste build.')
  process.exit(0)
}

function replaceOnce(from,to,label){
  if(!src.includes(from)) throw new Error(`Patch receita: não encontrei ${label}`)
  src=src.replace(from,to)
}

replaceOnce(
"function Editor({kind,form,setF,editing,accounts,cards,categories,error,busy,close,save}:any){const cats=categories.filter((c:any)=>kind==='move'&&form.type==='income'?c.kind!=='expense':c.kind!=='income');",
"function Editor({kind,form,setF,editing,accounts,cards,categories,error,busy,close,save}:any){/* RECEITA_UI_V2 */const cats=categories.filter((c:any)=>{if(kind!=='move')return c.kind!=='income';return form.type==='income'?(c.kind==='income'||c.kind==='both'):(c.kind==='expense'||c.kind==='both')});",
'filtro de categorias')

replaceOnce(
"<button type=\"button\" className={form.type==='expense'?'active':''} onClick={()=>setF('type','expense')}><ArrowDownRight/>Despesa</button><button type=\"button\" className={form.type==='income'?'active':''} onClick={()=>setF('type','income')}><ArrowUpRight/>Receita</button>",
"<button type=\"button\" className={form.type==='expense'?'active':''} onClick={()=>{setF('type','expense');setF('category_id','');setF('status','paid');setF('logo_url','');setF('payment_method','Pix')}}><ArrowDownRight/>Despesa</button><button type=\"button\" className={form.type==='income'?'active':''} onClick={()=>{setF('type','income');setF('category_id','');setF('status','paid');setF('logo_url','');setF('payment_method','Pix')}}><ArrowUpRight/>Receita</button>",
'alternância receita/despesa')

replaceOnce(
"<F l=\"Descrição\"><input required value={form.description||''} onChange={e=>setF('description',e.target.value)} placeholder=\"Ex.: Mercado do mês\"/></F>",
"<F l={form.type==='income'?'Origem da receita':'Descrição'}><input required value={form.description||''} onChange={e=>setF('description',e.target.value)} placeholder={form.type==='income'?'Ex.: Salário, presente, freelance':'Ex.: Mercado do mês'}/></F>",
'descrição do lançamento')

replaceOnce(
"<F l=\"Forma\"><select value={form.payment_method||'Pix'} onChange={e=>setF('payment_method',e.target.value)}>{['Pix','Cartão de crédito','Cartão de débito','Boleto','Dinheiro','Transferência','Débito automático','Outro'].map(x=><option key={x}>{x}</option>)}</select></F>",
"<F l={form.type==='income'?'Recebido por':'Forma de pagamento'}><select value={form.payment_method||'Pix'} onChange={e=>setF('payment_method',e.target.value)}>{(form.type==='income'?['Pix','Transferência','Dinheiro','Depósito','TED/DOC','Outro']:['Pix','Cartão de crédito','Cartão de débito','Boleto','Dinheiro','Transferência','Débito automático','Outro']).map(x=><option key={x}>{x}</option>)}</select></F>",
'forma de pagamento')

replaceOnce(
"<F l=\"Status\"><select value={form.status||'paid'} onChange={e=>setF('status',e.target.value)}><option value=\"paid\">Pago</option><option value=\"pending\">Previsto</option><option value=\"cancelled\">Cancelado</option></select></F>",
"<F l={form.type==='income'?'Situação da receita':'Status'}><select value={form.status||'paid'} onChange={e=>setF('status',e.target.value)}>{form.type==='income'?<><option value=\"paid\">Recebido</option><option value=\"pending\">A receber</option><option value=\"cancelled\">Cancelado</option></>:<><option value=\"paid\">Pago</option><option value=\"pending\">A pagar</option><option value=\"cancelled\">Cancelado</option></>}</select></F>",
'status do lançamento')

src=src.replace("title={form.type==='income'?'Ícone da receita':'Ícone / logo da despesa'}", "title={form.type==='income'?'Origem / ícone da receita':'Ícone / logo da despesa'}")

fs.writeFileSync(file,src)
console.log('Categorias, status e opções de receita corrigidos.')
