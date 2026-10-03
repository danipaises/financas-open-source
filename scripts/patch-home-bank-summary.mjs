import fs from 'node:fs'

const file='src/pages/Dashboard3.tsx'
const cssFile='src/dashboard3.css'
let src=fs.readFileSync(file,'utf8')
let css=fs.readFileSync(cssFile,'utf8')

if(src.includes('HOME_BANK_SUMMARY_V1')){
  console.log('Resumo bancário da tela inicial e correções mobile já aplicados neste build.')
  process.exit(0)
}

function replaceOnce(from,to,label){
  if(!src.includes(from)){
    console.warn(`Patch home/bancos: estrutura de ${label} não encontrada; seguindo sem interromper o build.`)
    return false
  }
  src=src.replace(from,()=>to)
  return true
}

replaceOnce(
  '<Home income={income} expense={expense} balance={balance} moves={monthMoves} subs={subscriptions} open={open} go={setView} catMap={catMap}/>',
  '<Home income={income} expense={expense} balance={balance} moves={monthMoves} subs={subscriptions} open={open} go={setView} catMap={catMap} bankRows={accountStats} totalAccountBalance={totalAccountBalance} totalReceived={totalReceived} totalSpent={totalSpent}/>',
  'chamada da Home'
)

replaceOnce(
  'function Home({income,expense,balance,moves,subs,open,go,catMap}:any){',
  'function Home({income,expense,balance,moves,subs,open,go,catMap,bankRows,totalAccountBalance,totalReceived,totalSpent}:any){/* HOME_BANK_SUMMARY_V1 */',
  'assinatura da Home'
)

const homeStart=src.indexOf('function Home(')
const quickStart=src.indexOf('\nfunction Quick(',homeStart)
if(homeStart>=0&&quickStart>homeStart){
  let home=src.slice(homeStart,quickStart)
  const needle='</div><div className="fx-grid">'
  const pos=home.indexOf(needle)
  if(pos>=0&&!home.includes('<HomeBankSummary')){
    home=home.slice(0,pos+6)+'<HomeBankSummary rows={bankRows||[]} totalBalance={totalAccountBalance||0} totalReceived={totalReceived||0} totalSpent={totalSpent||0} go={go}/>'+home.slice(pos+6)
    src=src.slice(0,homeStart)+home+src.slice(quickStart)
  }else if(pos<0){
    console.warn('Patch home/bancos: ponto de inserção abaixo dos quatro cartões não encontrado.')
  }
}

const quickAnchor='function Quick({icon,label,onClick}:{icon:ReactNode;label:string;onClick:()=>void})'
if(src.includes(quickAnchor)&&!src.includes('function HomeBankSummary(')){
  const component=`function HomeBankSummary({rows,totalBalance,totalReceived,totalSpent,go}:any){return <section className="fx-home-banks"><div className="fx-home-banks-head"><div><span>SALDO TOTAL NAS CONTAS</span><strong className={totalBalance>=0?'good':'bad'}>{money(totalBalance)}</strong><small>{rows.length||0} {rows.length===1?'conta':'contas'} · + {money(totalReceived)} recebidos · - {money(totalSpent)} gastos</small></div><button type="button" onClick={()=>go('accounts')}>Ver contas <ChevronRight/></button></div>{rows.length?<div className="fx-home-bank-scroll">{rows.map((x:any)=><button type="button" className="fx-home-bank-card" key={x.id} onClick={()=>go('accounts')}><Avatar url={x.logo_url} label={x.name} fallback="🏦" size="sm"/><div><b>{x.institution_name||x.name}</b><strong>{money(x._balance)}</strong><small>+ {money(x._received)} recebidos</small><small>- {money(x._spent)} gastos</small></div><ChevronRight/></button>)}</div>:<button type="button" className="fx-home-no-bank" onClick={()=>go('accounts')}><Landmark/><div><b>Nenhuma conta cadastrada</b><span>Cadastre um banco para acompanhar o saldo real.</span></div><ChevronRight/></button>}</section>}\n`
  src=src.replace(quickAnchor,component+quickAnchor)
}

// Faz o botão físico de voltar do PWA retornar para a tela anterior do próprio app.
const loadEffect=' useEffect(()=>{load()},[])'
if(src.includes(loadEffect)&&!src.includes('PWA_BACK_NAV_V1')){
  src=src.replace(loadEffect,`${loadEffect}\n /* PWA_BACK_NAV_V1 */\n useEffect(()=>{const state=history.state||{};if(!state.fxView)history.replaceState({...state,fxView:'home'},'',location.href);const onPop=(e:PopStateEvent)=>{const next=(e.state?.fxView||'home') as View;setView(next);window.scrollTo({top:0,behavior:'auto'})};window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop)},[])\n useEffect(()=>{const current=history.state?.fxView;if(current===view)return;if(view==='home')history.replaceState({...history.state,fxView:'home'},'',location.href);else history.pushState({...history.state,fxView:view},'',location.href);window.scrollTo({top:0,behavior:'auto'})},[view])`)
}

const cssExtra=`
/* HOME_BANK_SUMMARY_V1 - resumo das contas na Home + correção de largura do PWA */
html,body,#root{width:100%;max-width:100%;min-width:0;margin:0;overflow-x:hidden}#root{min-height:100dvh;background:#06100c}.fx-app{width:100%;max-width:100%;min-width:0;grid-template-columns:minmax(0,280px) minmax(0,1fr);overflow-x:clip}.fx-main,.fx-view{min-width:0}.fx-home-banks{margin:0 0 17px;background:linear-gradient(145deg,#0e1d15,#09140f);border:1px solid #24402f;border-radius:22px;overflow:hidden}.fx-home-banks-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:17px 19px;border-bottom:1px solid #1a3023}.fx-home-banks-head>div{display:grid;gap:3px}.fx-home-banks-head span{font-size:10px;font-weight:900;letter-spacing:.11em;color:#7f9689}.fx-home-banks-head strong{font-size:27px;letter-spacing:-.03em}.fx-home-banks-head small{color:#7f9488;font-size:11px}.fx-home-banks-head>button{display:flex;align-items:center;gap:4px;border:0;background:transparent;color:#6be592;font-weight:850;cursor:pointer;white-space:nowrap}.fx-home-banks-head>button svg{width:16px}.fx-home-bank-scroll{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px;padding:12px}.fx-home-bank-card,.fx-home-no-bank{border:1px solid #20392a;background:#0c1912;color:#eef9f2;border-radius:16px;padding:12px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;text-align:left;cursor:pointer;min-width:0}.fx-home-bank-card>div{display:grid;min-width:0}.fx-home-bank-card b{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fx-home-bank-card strong{font-size:18px;margin:3px 0;color:#eaf7ee}.fx-home-bank-card small{font-size:9.5px;color:#82968a;line-height:1.4}.fx-home-bank-card>svg,.fx-home-no-bank>svg:last-child{width:15px;color:#597468}.fx-home-no-bank{margin:12px;width:calc(100% - 24px)}.fx-home-no-bank>svg:first-child{color:#62df8b}.fx-home-no-bank div{display:grid;gap:2px}.fx-home-no-bank span{font-size:11px;color:#7f9488}
@media(max-width:900px){html,body,#root{width:100%!important;max-width:100%!important;min-width:0!important}.fx-app{display:block!important;width:100vw!important;max-width:100vw!important;min-width:0!important;min-height:100dvh!important;margin:0!important;background:radial-gradient(circle at 70% -20%,#123a28 0,transparent 34%),#06100c!important}.fx-main{width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding-left:max(14px,env(safe-area-inset-left))!important;padding-right:max(14px,env(safe-area-inset-right))!important}.fx-view{width:100%;max-width:100%;min-width:0}.fx-home-bank-scroll{display:flex;overflow-x:auto;scroll-snap-type:x proximity;overscroll-behavior-x:contain;padding-bottom:13px;scrollbar-width:none}.fx-home-bank-scroll::-webkit-scrollbar{display:none}.fx-home-bank-card{flex:0 0 min(78vw,265px);scroll-snap-align:start}.fx-bottom{width:100vw;max-width:100vw}}
@media(max-width:520px){.fx-home-banks-head{align-items:flex-start}.fx-home-banks-head strong{font-size:24px}.fx-home-banks-head small{max-width:230px}.fx-home-banks-head>button{font-size:11px;padding-top:4px}}
`
if(!css.includes('HOME_BANK_SUMMARY_V1 - resumo das contas')) css+=cssExtra

fs.writeFileSync(file,src)
fs.writeFileSync(cssFile,css)
console.log('Resumo de saldo total e por banco adicionado à tela inicial; largura do PWA e botão Voltar corrigidos.')
