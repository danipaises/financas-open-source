import type { Session } from '@supabase/supabase-js'
import { ArrowRight, BarChart3, Github, LockKeyhole, Smartphone, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'

const icon='https://i.postimg.cc/MpCZkZSr/icon-192.png'
const iconBig='https://i.postimg.cc/Pq1XdGX2/icon-512.png'

export default function Landing({ session }: { session: Session | null }) {
  return (
    <main className="landing">
      <nav className="topbar landing-nav">
        <div className="brand"><img src={icon} alt=""/><strong>Finanças Open Source</strong></div>
        <div className="nav-actions">
          <a className="ghost-btn" href="https://github.com/danipaises/financas-open-source" target="_blank" rel="noreferrer"><Github size={18}/> GitHub</a>
          <Link className="primary-btn" to={session?'/app':'/entrar'}>{session?'Abrir aplicativo':'Acesse seu aplicativo agora'} <ArrowRight size={18}/></Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">GRATUITO • OPEN SOURCE • SEUS DADOS</span>
          <h1>Suas finanças, claras e sob o seu controle.</h1>
          <p>Organize receitas, gastos, cartões, assinaturas e parcelas em um aplicativo moderno, rápido e transparente.</p>
          <div className="hero-actions">
            <Link className="primary-btn large" to={session?'/app':'/entrar'}>Acesse seu aplicativo agora <ArrowRight size={20}/></Link>
            <a className="secondary-btn large" href="#recursos">Conhecer recursos</a>
          </div>
          <p className="fineprint">Sem Apps Script. Backend seguro com Supabase. Pronto para Cloudflare Pages.</p>
        </div>
        <div className="hero-card">
          <img className="hero-icon" src={iconBig} alt="Ícone do Finanças Open Source"/>
          <div className="mock-grid">
            <div><span>Saldo previsto</span><strong>R$ 3.840,20</strong></div>
            <div><span>Receitas</span><strong className="positive">R$ 5.200,00</strong></div>
            <div><span>Gastos</span><strong>R$ 1.359,80</strong></div>
            <div><span>Assinaturas</span><strong>R$ 97,70</strong></div>
          </div>
        </div>
      </section>

      <section id="recursos" className="features shell">
        <article><WalletCards/><h3>Controle completo</h3><p>Compras, receitas, parcelamentos, assinaturas, bancos, Pix e cartões.</p></article>
        <article><BarChart3/><h3>Análises simples</h3><p>Resumo mensal, categorias, compromissos futuros e visão do seu saldo.</p></article>
        <article><LockKeyhole/><h3>Privacidade por usuário</h3><p>RLS no Supabase garante que cada conta veja somente os próprios dados.</p></article>
        <article><Smartphone/><h3>PWA de verdade</h3><p>Instale no celular com ícone próprio e experiência responsiva.</p></article>
      </section>

      <section className="open-source shell">
        <div><span className="eyebrow">OPEN SOURCE</span><h2>Transparente por padrão.</h2><p>O código pode ser auditado, estudado, modificado e melhorado pela comunidade.</p></div>
        <a className="secondary-btn large" href="https://github.com/danipaises/financas-open-source" target="_blank" rel="noreferrer"><Github size={20}/> Ver código no GitHub</a>
      </section>

      <footer>Finanças Open Source • Produzido por Dani Países Store Web</footer>
    </main>
  )
}
