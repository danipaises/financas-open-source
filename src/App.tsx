import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard2'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="app-loader">Carregando Finanças Open Source…</div>

  return (
    <Routes>
      <Route path="/" element={<Landing session={session} />} />
      <Route path="/entrar" element={session ? <Navigate to="/app" replace /> : <Login />} />
      <Route path="/app" element={session ? <Dashboard session={session} /> : <Navigate to="/entrar" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
