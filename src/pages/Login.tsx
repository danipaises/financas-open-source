import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

const googleEnabled=import.meta.env.VITE_GOOGLE_AUTH_ENABLED==='true'

export default function Login(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [mode,setMode]=useState<'signin'|'signup'>('signin')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const navigate=useNavigate()

  async function submit(e:React.FormEvent){
    e.preventDefault()
    setBusy(true);setMessage('')
    try{
      const result=mode==='signup'
        ? await supabase.auth.signUp({
            email,
            password,
            options:{emailRedirectTo:`${window.location.origin}/app`}
          })
        : await supabase.auth.signInWithPassword({email,password})
      if(result.error)return setMessage(result.error.message)
      if(mode==='signup'&&!result.data.session)return setMessage('Conta criada. Confirme seu e-mail para continuar.')
      navigate('/app')
    }catch(err){
      setMessage(err instanceof Error?err.message:'Não foi possível conectar ao Supabase.')
    }finally{
      setBusy(false)
    }
  }

  async function signInGoogle(){
    const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/app`}})
    if(error)setMessage(error.message)
  }

  return <main className="auth-page"><div className="auth-card">
    <Link className="back-link" to="/"><ArrowLeft size={18}/> Voltar</Link>
    <img className="auth-logo" src="https://i.postimg.cc/MpCZkZSr/icon-192.png" alt=""/>
    <h1>{mode==='signin'?'Entre no seu financeiro':'Crie sua conta'}</h1>
    <p>Seus dados ficam separados e protegidos por usuário.</p>
    {googleEnabled&&<><button className="google-btn" onClick={signInGoogle}>G&nbsp;&nbsp;Continuar com Google</button><div className="separator"><span/>ou<span/></div></>}
    <form onSubmit={submit}>
      <label>E-mail<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com"/></label>
      <label>Senha<input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"/></label>
      <button className="primary-btn full" disabled={busy}>{busy?'Aguarde…':mode==='signin'?'Entrar':'Criar conta'}</button>
    </form>
    {message&&<div className="message-box">{message}</div>}
    <button className="link-button" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>{mode==='signin'?'Ainda não tenho conta':'Já tenho uma conta'}</button>
    <div className="auth-safe"><ShieldCheck size={17}/> Supabase Auth + Row Level Security</div>
  </div></main>
}
