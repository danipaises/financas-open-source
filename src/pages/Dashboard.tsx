import { useEffect,useMemo,useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { BarChart3,CalendarDays,CreditCard,LogOut,Plus,RefreshCw,Settings,Wallet,X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Transaction } from '../lib/types'

const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})

export default function Dashboard({session}:{session:Session}){
  const [transactions,setTransactions]=useState<Transaction[]>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [showAdd,setShowAdd]=useState(false)
  const [type,setType]=useState<'income'|'expense'>('expense')
  const [description,setDescription]=useState('')
  const [amount,setAmount]=useState('')
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))

  async function load(){
    setLoading(true);setError('')
    const start=new Date();start.setDate(1)
    const end=new Date(start);end.setMonth(end.getMonth()+1)
    const {data,error}=await supabase.from('transactions').select('*').gte('occurred_on',start.toISOString().slice(0,10)).lt('occurred_on',end.toISOString().slice(0,10)).order('occurred_on',{ascending:false})
    setLoading(false)
    if(error){setError(error.message);return}
    setTransactions((data||[]) as Transaction[])
  }

  useEffect(()=>{load()},[])

  const summary=useMemo(()=>{
    const income=transactions.filter(t=>t.type==='income'&&t.status!=='cancelled').reduce((s,t)=>s+Number(t.amount),0)
    const expense=transactions.filter(t=>t.type==='expense'&&t.status!=='cancelled').reduce((s,t)=>s+Number(t.amount),0)
    return{income,expense,balance:income-expense}
  },[transactions])

  async function addTransaction(e:React.FormEvent){
    e.preventDefault();setError('')
    const value=Number(String(amount).replace(',','.'))
    if(!description.trim()||!Number.isFinite(value)||value<=0)return setError('Preencha descrição e valor corretamente.')
    const {error}=await supabase.from('transactions').insert({user_id:session.user.id,type,description:description.trim(),amount:value,occurred_on:date,status:'paid'})
    if(error)return setError(error.message)
    setDescription('');setAmount('');setShowAdd(false);load()
  }

  return <main className="dashboard-page">
    <aside className="sidebar">
      <div className="brand side-brand"><img src="https://i.postimg.cc/MpCZkZSr/icon-192.png" alt=""/><strong>Finanças</strong></div>
      <nav>
        <button className="active"><Wallet/>Visão geral</button>
        <button><CalendarDays/>Calendário</button>
        <button><BarChart3/>Análises</button>
        <button><CreditCard/>Cartões</button>
        <button><Settings/>Configurações</button>
      </nav>
      <button className="logout" onClick={()=>supabase.auth.signOut()}><LogOut/>Sair</button>
    </aside>
    <section className="dashboard-main">
      <header className="dash-header">
        <div><span className="eyebrow">FINANÇAS OPEN SOURCE</span><h1>Visão geral</h1><p>{session.user.email}</p></div>
        <button className="primary-btn" onClick={()=>setShowAdd(true)}><Plus/> Novo lançamento</button>
      </header>
      <div className="summary-grid">
        <article><span>Saldo do mês</span><strong className={summary.balance>=0?'positive':''}>{brl.format(summary.balance)}</strong></article>
        <article><span>Receitas</span><strong className="positive">{brl.format(summary.income)}</strong></article>
        <article><span>Gastos</span><strong>{brl.format(summary.expense)}</strong></article>
        <article><span>Lançamentos</span><strong>{transactions.length}</strong></article>
      </div>
      <section className="panel">
        <div className="panel-title"><div><h2>Movimentações do mês</h2><p>Receitas e despesas registradas.</p></div><button className="icon-btn" onClick={load}><RefreshCw size={18}/></button></div>
        {loading?<div className="empty">Carregando dados…</div>:error?<div className="message-box">{error}</div>:transactions.length===0?<div className="empty">Nenhum lançamento ainda. Use “Novo lançamento”.</div>:<div className="transaction-list">{transactions.map(t=><div className="transaction" key={t.id}><div className={`tx-icon ${t.type}`}>{t.type==='income'?'↑':'↓'}</div><div className="tx-main"><strong>{t.description}</strong><span>{new Date(`${t.occurred_on}T12:00:00`).toLocaleDateString('pt-BR')}</span></div><strong className={t.type==='income'?'positive':''}>{t.type==='income'?'+':'-'} {brl.format(Number(t.amount))}</strong></div>)}</div>}
      </section>
    </section>
    {showAdd&&<div className="modal-backdrop" onClick={()=>setShowAdd(false)}><form className="modal" onSubmit={addTransaction} onClick={e=>e.stopPropagation()}><button type="button" className="modal-close" onClick={()=>setShowAdd(false)}><X/></button><h2>Novo lançamento</h2><div className="segmented"><button type="button" className={type==='expense'?'selected':''} onClick={()=>setType('expense')}>Despesa</button><button type="button" className={type==='income'?'selected':''} onClick={()=>setType('income')}>Receita</button></div><label>Descrição<input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ex.: Mercado"/></label><label>Valor<input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0,00"/></label><label>Data<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><button className="primary-btn full">Salvar lançamento</button>{error&&<div className="message-box">{error}</div>}</form></div>}
  </main>
}
